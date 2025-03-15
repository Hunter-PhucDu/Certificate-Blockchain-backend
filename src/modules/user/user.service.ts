import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AuthService } from '../../modules/auth/auth.service';
import { ListRecordSuccessResponseDto } from '../../modules/shared/dtos/list-record-success-response.dto';
import { MetadataResponseDto } from '../../modules/shared/dtos/metadata-response.dto';
import { ERole } from '../../modules/shared/enums/auth.enum';
import { IJwtPayload } from '../../modules/shared/interfaces/auth.interface';
import { UserModel } from '../shared/models/superAdmin.model';
import { getPagination } from '../../modules/shared/utils/get-pagination';
import {
  AddUserRequestDto,
  ChangePasswordRequestDto,
  GetUsersRequestDto,
  UpdateUserRequestDto,
} from './dtos/request.dto';
import { ChangePasswordResponseDto, UserResponseDto } from './dtos/response.dto';
import { EmailService } from 'modules/email/email.service';
import { unlinkSync } from 'fs';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly userModel: UserModel,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async addUser(addUserDto: AddUserRequestDto, avatar?: string): Promise<UserResponseDto> {
    try {
      const { userName, fullName, email, password } = addUserDto;
      const existedUser = await this.userModel.model.findOne({
        $or: [{ userName }, { email }],
      });

      if (existedUser) {
        throw new BadRequestException('UserName or Email has been registered.');
      }
      const hashedPw = await this.authService.hashPassword(password);

      const newUser = await this.userModel.save({
        ...addUserDto,
        password: hashedPw,
      });

      await this.emailService._sendMailConfirmationSignUp(email, fullName);

      return plainToClass(UserResponseDto, newUser.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while sign up: ${error.message}`);
    }
  }

  async updateUser(user: IJwtPayload, updateUserDto: UpdateUserRequestDto, avatar?: string): Promise<UserResponseDto> {
    const session = await this.userModel.model.startSession();
    session.startTransaction();

    try {
      const existingUser = await this.userModel.model.findById(user._id).session(session);

      if (!existingUser) {
        throw new BadRequestException('User not found');
      }

      const updateData: any = { ...updateUserDto };

      if (avatar) {
        if (existingUser.avatar) {
          try {
            unlinkSync(`./images/${existingUser.avatar}`);
          } catch (unlinkError) {
            throw new BadRequestException('Failed to delete old avatar file:', unlinkError);
          }
        }
        updateData.avatar = avatar;
      }

      const updatedUser = await this.userModel.model.findOneAndUpdate(
        { _id: user._id },
        { $set: updateData },
        { new: true, session },
      );

      await session.commitTransaction();
      session.endSession();

      return plainToClass(UserResponseDto, updatedUser.toObject());
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (avatar) {
        try {
          unlinkSync(`./images/${avatar}`);
        } catch (unlinkError) {
          console.error('Failed to delete avatar file:', unlinkError);
        }
      }

      throw new BadRequestException(`Error while updating user: ${error.message}`);
    }
  }

  async getUser(user: IJwtPayload): Promise<UserResponseDto> {
    if (user.role === ERole.USER) {
      if (user._id !== user._id) throw new UnauthorizedException('User is not allowed for this action');
    }

    const userDoc = await this.userModel.model.findById(user._id);

    const userObject = userDoc.toObject();
    if (userObject.avatar) {
      userObject.avatar = `${this.configService.get('BASE_URL')}/images/${userObject.avatar}`;
    }

    return plainToInstance(UserResponseDto, userObject);
  }

  async changePassword(
    user: IJwtPayload,
    changePasswordDto: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    try {
      const existedUser = await this.userModel.model.findById({ _id: user._id });
      if (!existedUser) {
        throw new BadRequestException('User not found');
      }
      const checkPw = await this.authService.checkPassword(changePasswordDto.password, existedUser.password);
      if (!checkPw) {
        throw new BadRequestException('Wrong password');
      }

      const hashedPw = await this.authService.hashPassword(changePasswordDto.newPassword);

      const updatedPw = await this.userModel.model.findOneAndUpdate(
        { _id: user._id },
        { password: hashedPw },
        { new: true },
      );

      return plainToClass(ChangePasswordResponseDto, updatedPw.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while changing password: ${error.message}`);
    }
  }

  async getUsers(): Promise<UserResponseDto[]> {
    try {
      const usersDoc = await this.userModel.model.find().exec();
      const users = usersDoc.map((doc) => {
        const userObject = doc.toObject();
        if (userObject.avatar) {
          userObject.avatar = `${this.configService.get('BASE_URL')}/images/${userObject.avatar}`;
        }
        return plainToInstance(UserResponseDto, userObject);
      });
      return users;

      //return usersDoc.map((doc) => doc.toObject());
    } catch (e) {
      throw new BadRequestException(`Error while getting users: ${e.message}`);
    }
  }

  async getUsersBySearch(paginationDto: GetUsersRequestDto): Promise<ListRecordSuccessResponseDto<UserResponseDto>> {
    const { page, size, search } = paginationDto;
    const skip = (page - 1) * size;

    const searchCondition = search
      ? { $or: [{ fullName: { $regex: new RegExp(search, 'i') } }, { email: { $regex: new RegExp(search, 'i') } }] }
      : {};

    const [users, totalItem] = await Promise.all([
      this.userModel.model.find(searchCondition).skip(skip).limit(size).exec(),
      this.userModel.model.countDocuments(searchCondition),
    ]);

    const metadata: MetadataResponseDto = getPagination(size, page, totalItem);
    const userResponseDtos: UserResponseDto[] = plainToInstance(UserResponseDto, users);

    return {
      metadata,
      data: userResponseDtos,
    };
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const deletedUser = await this.userModel.model.findOneAndDelete({ _id: userId });

      if (!deletedUser) {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      throw new BadRequestException(`Error while deleting user: ${error.message}`);
    }
  }
}

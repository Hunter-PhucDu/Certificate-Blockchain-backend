import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AuthService } from '../auth/auth.service';
import { ERole } from 'modules/shared/enums/auth.enum';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { AdminModel } from 'modules/shared/models/admin.model';
import {
  AddAdminRequestDto,
  ChangePasswordRequestDto,
  GetAdminsRequestDto,
  UpdateAdminRequestDto,
} from './dtos/request.dto';
import { AdminResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { getPagination } from 'modules/shared/utils/get-pagination';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminModel: AdminModel,
    private readonly authService: AuthService,
  ) {}

  async addAdmin(addAdminDto: AddAdminRequestDto): Promise<AdminResponseDto> {
    try {
      const { username, email, password } = addAdminDto;
      const existedUser = await this.adminModel.model.findOne({ username, email });

      if (existedUser) {
        throw new BadRequestException('Username or email has been registered.');
      }

      const hashedPw = await this.authService.hashPassword(password);

      const newUser = await this.adminModel.save({
        ...addAdminDto,
        password: hashedPw,
        isLocked: false,
        loginAttempts: 0,
        role: ERole.ADMIN,
      });
      return plainToClass(AdminResponseDto, newUser.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while add new admin: ${error.message}`);
    }
  }

  async getAdmin(user: IJwtPayload): Promise<AdminResponseDto> {
    try {
      const userDoc = await this.adminModel.model.findById({ _id: user._id });
      if (!userDoc) {
        throw new BadRequestException('Admin not found');
      }

      return plainToInstance(AdminResponseDto, userDoc.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while getting admin detail: ${error.message}`);
    }
  }

  async updateAdmin(user: IJwtPayload, updateAdminDto: UpdateAdminRequestDto): Promise<AdminResponseDto> {
    try {
      const userDoc = await this.adminModel.model.findById({ _id: user._id });
      if (!userDoc) {
        throw new BadRequestException('Admin not found');
      }

      const updatedUser = await this.adminModel.model.findOneAndUpdate(
        { _id: user._id },
        { $set: updateAdminDto },
        { new: true },
      );
      return plainToInstance(AdminResponseDto, updatedUser.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while updating admin: ${error.message}`);
    }
  }

  async getAdmins(paginationDto: GetAdminsRequestDto): Promise<ListRecordSuccessResponseDto<AdminResponseDto>> {
    const { page, size, search } = paginationDto;
    const skip = (page - 1) * size;

    const searchCondition = search
      ? { $or: [{ username: { $regex: new RegExp(search, 'i') } }, { email: { $regex: new RegExp(search, 'i') } }] }
      : {};

    const [admins, totalItem] = await Promise.all([
      this.adminModel.model.find(searchCondition).skip(skip).limit(size).exec(),
      this.adminModel.model.countDocuments(searchCondition),
    ]);

    const metadata: MetadataResponseDto = getPagination(size, page, totalItem);
    const adminResponseDtos: AdminResponseDto[] = plainToInstance(AdminResponseDto, admins);

    return {
      metadata,
      data: adminResponseDtos,
    };
  }

  async changePassword(user: IJwtPayload, changePasswordDto: ChangePasswordRequestDto): Promise<void> {
    try {
      const existedUser = await this.adminModel.model.findById({ _id: user._id });
      if (!existedUser) {
        throw new BadRequestException('Admin not found');
      }
      const checkPw = await this.authService.checkPassword(changePasswordDto.password, existedUser.password);
      if (!checkPw) {
        throw new BadRequestException('Wrong password');
      }

      const hashedPw = await this.authService.hashPassword(changePasswordDto.newPassword);

      await this.adminModel.model.findOneAndUpdate({ _id: user._id }, { password: hashedPw }, { new: true });
    } catch (error) {
      throw new BadRequestException(`Error while changing password: ${error.message}`);
    }
  }

  async deleteAdmin(userId: string): Promise<void> {
    try {
      const deletedUser = await this.adminModel.model.findOneAndDelete({ _id: userId });

      if (!deletedUser) {
        throw new BadRequestException('Admin not found');
      }
    } catch (error) {
      throw new BadRequestException(`Error while deleting admin: ${error.message}`);
    }
  }
}

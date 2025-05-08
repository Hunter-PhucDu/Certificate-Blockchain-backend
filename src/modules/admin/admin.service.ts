import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { LogService } from '../log/log.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminModel: AdminModel,
    private readonly authService: AuthService,
    private readonly logService: LogService,
  ) {}

  async addAdmin(user: IJwtPayload, addAdminDto: AddAdminRequestDto): Promise<AdminResponseDto> {
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

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'CREATE_ADMIN',
        JSON.stringify({
          adminId: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        }),
      );

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

  async updateAdmin(
    user: IJwtPayload,
    adminId: string,
    updateAdminDto: UpdateAdminRequestDto,
  ): Promise<AdminResponseDto> {
    try {
      const userDoc = await this.adminModel.model.findById({ _id: adminId });
      if (!userDoc) {
        await this.logService.createSystemLog(
          user.username,
          user.role,
          'UPDATE_ADMIN_FAILED',
          JSON.stringify({
            adminId: adminId,
            old_username: userDoc.username,
            update: updateAdminDto.username,
          }),
        );

        throw new BadRequestException('Admin not found');
      }

      const updatedUser = await this.adminModel.model.findOneAndUpdate(
        { _id: adminId },
        { $set: updateAdminDto },
        { new: true },
      );

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'UPDATE_ADMIN',
        JSON.stringify({
          adminId: adminId,
          old_username: userDoc.username,
          update: updateAdminDto.username,
        }),
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

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'CHANGE_PASSWORD',
        JSON.stringify({
          adminId: user._id,
          username: user.username,
        }),
      );
    } catch (error) {
      throw new BadRequestException(`Error while changing password: ${error.message}`);
    }
  }

  async deleteAdmin(user: IJwtPayload, id: string): Promise<void> {
    const deletedAdmin = await this.adminModel.model.findByIdAndDelete(id);
    if (!deletedAdmin) {
      throw new NotFoundException('Admin not found');
    }

    await this.logService.createSystemLog(
      user.username,
      user.role,
      'DELETE_ADMIN',
      JSON.stringify({
        adminId: deletedAdmin._id,
        username: deletedAdmin.username,
        email: deletedAdmin.email,
        role: deletedAdmin.role,
      }),
    );
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../auth/auth.service';
import { ERole } from 'modules/shared/enums/auth.enum';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { AdminModel } from 'modules/shared/models/admin.model';
import { AddAdminRequestDto, ChangePasswordRequestDto, ForgotPasswordAdminDto } from './dtos/request.dto';
import { AdminResponseDto, ChangePasswordResponseDto } from './dtos/response.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminModel: AdminModel,
    private readonly authService: AuthService,
  ) {}

  async addAdmin(addAdminDto: AddAdminRequestDto): Promise<AdminResponseDto> {
    try {
      const { userName, password } = addAdminDto;
      const existedUser = await this.adminModel.model.findOne({ userName });

      if (existedUser) {
        throw new BadRequestException('UserName, Email or phone number has been registered.');
      }

      const hashedPw = await this.authService.hashPassword(password);

      const newUser = await this.adminModel.save({
        ...addAdminDto,
        password: hashedPw,
        role: ERole.ADMIN,
      });
      return plainToClass(AdminResponseDto, newUser.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while add new admin: ${error.message}`);
    }
  }

  async getAdmins(): Promise<AdminResponseDto[]> {
    try {
      const adminsDoc = await this.adminModel.model.find().exec();
      return adminsDoc.map((doc) => doc.toObject());
    } catch (e) {
      throw new BadRequestException(`Error while getting admins: ${e.message}`);
    }
  }

  async changePassword(
    user: IJwtPayload,
    changePasswordDto: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
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

      const updatedPw = await this.adminModel.model.findOneAndUpdate(
        { _id: user._id },
        { password: hashedPw },
        { new: true },
      );

      return plainToClass(ChangePasswordResponseDto, updatedPw.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while changing password: ${error.message}`);
    }
  }

  async forgotPassword(forgotPwAdminDto: ForgotPasswordAdminDto): Promise<void> {
    const user = await this.adminModel.model.findOne({ userName: forgotPwAdminDto.userName });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const hashedPw = await this.authService.hashPassword(forgotPwAdminDto.newPassword);
    await this.adminModel.model.findOneAndUpdate({ _id: user._id }, { password: hashedPw }, { new: true });
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

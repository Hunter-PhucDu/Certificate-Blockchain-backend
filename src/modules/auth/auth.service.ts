import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  OtpForgotPasswordRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordLinkRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  ResetPasswordByAdminRequestDto,
} from './dtos/request.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AdminModel } from 'modules/shared/models/admin.model';
import { ConfigService } from '@nestjs/config';
import { ERole } from 'modules/shared/enums/auth.enum';
import { OtpModel } from 'modules/shared/models/otp.model';
import { LoginResponseDto, OrganizationLoginResponseDto, RefreshTokenResponseDto } from './dtos/response.dto';
import { OrganizationModel } from 'modules/shared/models/organization.model';
import { EmailService } from 'modules/email/email.service';
import { OtpType } from 'modules/shared/enums/otp.enum';
import { Types } from 'mongoose';
import { LogService } from '../log/log.service';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { TenantModel } from 'modules/shared/models/tenant.model';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly jwtService: JwtService,
    private readonly adminModel: AdminModel,
    private readonly organizationModel: OrganizationModel,
    private readonly tenantModel: TenantModel,
    private readonly configService: ConfigService,
    private readonly otpModel: OtpModel,
    private readonly emailService: EmailService,
    private readonly logService: LogService,
  ) {}

  async onModuleInit() {
    const countAdmins = await this.adminModel.model.countDocuments();

    if (countAdmins <= 0) {
      const password = this.configService.get('admin.password');
      const createdSuperAdmin = new this.adminModel.model({
        username: this.configService.get('admin.username'),
        password: await this.hashPassword(password),
        role: ERole.SUPER_ADMIN,
      });

      await createdSuperAdmin.save();
    }
  }

  async loginAdmin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const { username, password } = loginDto;

      const admin = await this.adminModel.model.findOne({
        $or: [{ username }, { email: username }],
      });

      if (admin) {
        const checkPw = await this.checkPassword(password, admin.password);

        if (admin.isLocked) {
          await this.logService.createSystemLog(
            admin.username,
            admin.role,
            'ADMIN_LOGIN_FAILED',
            JSON.stringify({
              username,
              reason: 'Account is locked',
            }),
          );
          throw new BadRequestException('Account is locked. Please contact the administrator.');
        }

        if (checkPw) {
          if (admin.loginAttempts > 0) {
            await this.adminModel.model.updateOne({ _id: admin._id }, { loginAttempts: 0 }, { new: true });
          }

          const accessToken = await this.generateAccessToken(admin._id, admin.email || admin.username, admin.role);
          const refreshToken = await this.generateRefreshToken(admin._id, admin.email || admin.username, admin.role);
          const tokens = { accessToken, refreshToken };

          await this.logService.createSystemLog(
            admin.username,
            admin.role,
            'ADMIN_LOGIN_SUCCESS',
            JSON.stringify({
              adminId: admin._id,
              username: admin.username,
              email: admin.email,
              role: admin.role,
            }),
          );

          return tokens;
        }

        if (admin.loginAttempts < 4) {
          await this.adminModel.model.updateOne({ _id: admin._id }, { $inc: { loginAttempts: 1 } }, { new: true });

          await this.logService.createSystemLog(
            admin.username,
            admin.role,
            'ADMIN_LOGIN_FAILED',
            JSON.stringify({
              adminId: admin._id,
              username: admin.username,
              email: admin.email,
              reason: 'Invalid password',
              remainingAttempts: 4 - admin.loginAttempts,
            }),
          );

          throw new BadRequestException(
            `Password is incorrect. You have \`${4 - admin.loginAttempts}\` attempts to try. If you're wrong, the account will be locked.`,
          );
        }

        if (admin.loginAttempts === 4) {
          await this.adminModel.model.updateOne(
            { _id: admin._id },
            { $inc: { loginAttempts: 1 }, isLocked: true },
            { new: true },
          );

          await this.logService.createSystemLog(
            admin.username,
            admin.role,
            'ADMIN_ACCOUNT_LOCKED',
            JSON.stringify({
              adminId: admin._id,
              username: admin.username,
              email: admin.email,
              reason: 'Too many failed login attempts',
              checkPw: checkPw,
            }),
          );

          throw new BadRequestException('Account is locked. Please contact the administrator.');
        }
      }

      await this.logService.createSystemLog(
        admin.username,
        admin.role,
        'ADMIN_LOGIN_FAILED',
        JSON.stringify({
          username,
          reason: 'User not found',
        }),
      );

      throw new BadRequestException('Username or password is incorrect.');
    } catch (error) {
      throw new BadRequestException(`Error while login: ${error.message}`);
    }
  }

  async loginOrganization(loginDto: LoginRequestDto): Promise<OrganizationLoginResponseDto> {
    try {
      const { username, password } = loginDto;
      const subdomain = this.request['subdomain'];

      if (!subdomain) {
        throw new BadRequestException('Subdomain is required');
      }

      const tenant = await this.tenantModel.model.findOne({ subdomain });

      if (!tenant) {
        throw new BadRequestException('Invalid subdomain');
      }

      const organizationByEmail = await this.organizationModel.model.findOne({
        email: username,
      });

      const organization =
        organizationByEmail && organizationByEmail.tenantId.toString() === tenant._id.toString()
          ? organizationByEmail
          : null;

      if (organization) {
        const checkPw = await this.checkPassword(password, organization.password);
        if (organization.isLocked) {
          await this.logService.createSystemLog(
            organization.email,
            organization.role,
            'ORGANIZATION_LOGIN_FAILED',
            JSON.stringify({
              username,
              reason: 'Account is locked',
            }),
          );
          throw new BadRequestException('Account is locked. Please contact the administrator.');
        }

        if (checkPw) {
          if (organization.loginAttempts > 0) {
            await this.organizationModel.model.updateOne(
              { _id: organization._id },
              { loginAttempts: 0 },
              { new: true },
            );
          }
          const accessToken = await this.generateAccessToken(organization._id, organization.email, organization.role);
          const refreshToken = await this.generateRefreshToken(organization._id, organization.email, organization.role);
          const tokens = { accessToken, refreshToken };

          const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
          await this.logService.createTenantLog(
            tenantDbName,
            organization.email,
            organization.role,
            'ORGANIZATION_LOGIN_SUCCESS',
            JSON.stringify({
              organizationId: organization._id,
              email: organization.email,
              role: organization.role,
            }),
          );

          return tokens;
        }

        if (organization.loginAttempts < 4) {
          await this.organizationModel.model.updateOne(
            { _id: organization._id },
            { $inc: { loginAttempts: 1 } },
            { new: true },
          );

          const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
          await this.logService.createTenantLog(
            tenantDbName,
            organization.email,
            organization.role,
            'ORGANIZATION_LOGIN_FAILED',
            JSON.stringify({
              organizationId: organization._id,
              email: organization.email,
              reason: 'Invalid password',
              remainingAttempts: 4 - organization.loginAttempts,
            }),
          );

          throw new BadRequestException(
            `Username or password is incorrect. You have \`${4 - organization.loginAttempts}\` attempts to try. If you're wrong, the account will be locked.`,
          );
        }

        if (organization.loginAttempts === 4) {
          await this.organizationModel.model.updateOne(
            { _id: organization._id },
            { $inc: { loginAttempts: 1 }, isLocked: true },
            { new: true },
          );

          const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
          await this.logService.createTenantLog(
            tenantDbName,
            organization.email,
            organization.role,
            'ORGANIZATION_ACCOUNT_LOCKED',
            JSON.stringify({
              organizationId: organization._id,
              email: organization.email,
              reason: 'Too many failed login attempts',
            }),
          );

          throw new BadRequestException('Account is locked. Please contact the administrator.');
        }
      }
      throw new BadRequestException('Username or password is incorrect.');
    } catch (error) {
      throw new BadRequestException(`Error while login: ${error.message}`);
    }
  }

  async getOtpForgotPasswordAdmin(forgotPwDto: OtpForgotPasswordRequestDto): Promise<void> {
    try {
      const admin = await this.adminModel.model.findOne({ email: forgotPwDto.email });

      if (!admin) {
        throw new BadRequestException('User not found.');
      }

      await this.emailService.generateAndSendOtp(admin.email, admin._id, admin.role, OtpType.FORGOT_PASSWORD);
    } catch (error) {
      throw new BadRequestException(`Error while get OTP: ${error.message}`);
    }
  }

  async getOtpForgotPasswordOrganization(forgotPwDto: OtpForgotPasswordRequestDto): Promise<void> {
    try {
      const user = await this.organizationModel.model.findOne({ email: forgotPwDto.email });

      if (!user) {
        throw new BadRequestException('User not found.');
      }

      if (user.isLocked) {
        throw new BadRequestException('Account is locked. Please contact the administrator.');
      }

      await this.emailService.generateAndSendOtp(user.email, user._id, user.role, OtpType.FORGOT_PASSWORD);
    } catch (error) {
      throw new BadRequestException(`Error while get OTP: ${error.message}`);
    }
  }

  async resendOtpForgotPasswordAdmin(forgotPwDto: OtpForgotPasswordRequestDto): Promise<void> {
    try {
      const user = await this.adminModel.model.findOne({ email: forgotPwDto.email });
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      await this.emailService.resendOtp(user.email, user._id, user.role, OtpType.FORGOT_PASSWORD);
    } catch (error) {
      throw new BadRequestException(`Error while resend OTP: ${error.message}`);
    }
  }

  async resendOtpForgotPasswordOrganization(forgotPwDto: OtpForgotPasswordRequestDto): Promise<void> {
    try {
      const user = await this.organizationModel.model.findOne({ email: forgotPwDto.email });
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      await this.emailService.resendOtp(user.email, user._id, user.role, OtpType.FORGOT_PASSWORD);
    } catch (error) {
      throw new BadRequestException(`Error while resend OTP: ${error.message}`);
    }
  }

  async sendLinkResetPasswordAdmin(forgotPwDto: ForgotPasswordRequestDto): Promise<void> {
    const session = await this.otpModel.model.startSession();
    session.startTransaction();

    try {
      const admin = await this.adminModel.model.findOne({ email: forgotPwDto.email });

      if (!admin) {
        throw new BadRequestException('User not found.');
      }

      const otpDoc = await this.otpModel.model
        .findOne({
          accountId: admin._id,
          accountType: admin.role,
          otp: forgotPwDto.otp,
          type: OtpType.FORGOT_PASSWORD,
          expiresAt: { $gt: new Date() },
          isUsed: false,
        })
        .session(session);

      if (!otpDoc) {
        throw new BadRequestException('Invalid or expired OTP.');
      }

      await this.otpModel.model.updateOne({ _id: otpDoc._id }, { isUsed: true }, { session });

      const token = crypto.randomBytes(32).toString('hex');

      await this.emailService.sendPasswordResetLink(forgotPwDto.email, admin._id, admin.role, token, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(`Error while send link reset password: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  async sendLinkResetPasswordOrganization(forgotPwDto: ForgotPasswordRequestDto): Promise<void> {
    const session = await this.otpModel.model.startSession();
    session.startTransaction();
    try {
      const user = await this.organizationModel.model.findOne({ email: forgotPwDto.email });

      if (!user) {
        throw new BadRequestException('User not found.');
      }

      const otpDoc = await this.otpModel.model
        .findOne({
          accountId: user._id,
          accountType: user.role,
          otp: forgotPwDto.otp,
          type: OtpType.FORGOT_PASSWORD,
          expiresAt: { $gt: new Date() },
          isUsed: false,
        })
        .session(session);

      if (!otpDoc) {
        throw new BadRequestException('Invalid or expired OTP.');
      }

      const verify = this.verifyOtp(user._id, user.role, forgotPwDto.otp, OtpType.FORGOT_PASSWORD);

      if (!verify) {
        throw new BadRequestException('Invalid or expired OTP.');
      }

      const token = crypto.randomBytes(32).toString('hex');

      await this.emailService.sendPasswordResetLink(forgotPwDto.email, user._id, user.role, token);

      await session.commitTransaction();
    } catch (error) {
      throw new BadRequestException(`Error while send link reset password: ${error.message}`);
    }
  }

  async resetPasswordWithToken(token: string, resetPasswordDto: ResetPasswordLinkRequestDto): Promise<void> {
    try {
      const verification = await this.verifyPasswordResetToken(token);

      if (!verification.valid) {
        throw new BadRequestException('Invalid or expired reset link');
      }

      const newPassword = await this.hashPassword(resetPasswordDto.newPassword);
      const accountType = verification.accountType as ERole;
      const accountId = verification.accountId;

      if (accountType === ERole.SUPER_ADMIN || accountType === ERole.ADMIN) {
        await this.adminModel.model.findByIdAndUpdate(
          accountId,
          {
            password: newPassword,
            isLocked: false,
            loginAttempts: 0,
          },
          { new: true },
        );
      } else if (accountType === ERole.ORGANIZATION) {
        await this.organizationModel.model.findByIdAndUpdate(
          accountId,
          {
            password: newPassword,
            isLocked: false,
            loginAttempts: 0,
          },
          { new: true },
        );
      }

      await this.otpModel.model.updateOne(
        { verificationToken: token, type: OtpType.RESET_PASSWORD },
        { isUsed: true },
        { new: true },
      );
    } catch (error) {
      throw new BadRequestException(`Error while reset password: ${error.message}`);
    }
  }

  async resetPasswordOrganizationByAdmin(
    user: IJwtPayload,
    resetPasswordDto: ResetPasswordByAdminRequestDto,
  ): Promise<void> {
    try {
      const userDoc = await this.organizationModel.model.findOne({ email: resetPasswordDto.email });

      if (!userDoc) {
        throw new BadRequestException('User not found.');
      }

      const hashedPw = await this.hashPassword(resetPasswordDto.newPassword);

      await this.organizationModel.model.findByIdAndUpdate(
        userDoc._id,
        {
          password: hashedPw,
          isLocked: false,
          loginAttempts: 0,
        },
        { new: true },
      );

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'ORGANIZATION_RESET_PASSWORD_BY_ADMIN',
        JSON.stringify({
          organizationId: userDoc._id.toString(),
          email: userDoc.email,
        }),
      );

      const tenantDoc = await this.tenantModel.model.findById(userDoc.tenantId);
      if (tenantDoc) {
        const tenantDbName = `tenant_${tenantDoc.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
        await this.logService.createTenantLog(
          tenantDbName,
          user.username,
          user.role,
          'ORGANIZATION_RESET_PASSWORD_BY_ADMIN',
          JSON.stringify({
            organizationId: userDoc._id.toString(),
            email: userDoc.email,
          }),
        );
      }
    } catch (error) {
      throw new BadRequestException(`Error while reset password: ${error.message}`);
    }
  }

  async resetPasswordAdminBySuperAdmin(
    user: IJwtPayload,
    resetPasswordDto: ResetPasswordByAdminRequestDto,
  ): Promise<void> {
    try {
      const admin = await this.adminModel.model.findOne({ email: resetPasswordDto.email });

      if (!admin) {
        throw new BadRequestException('User not found.');
      }

      if (admin.isLocked) {
        await this.adminModel.model.updateOne({ _id: admin._id }, { isLocked: false, loginAttempts: 0 }, { new: true });
      }

      const hashedPw = await this.hashPassword(resetPasswordDto.newPassword);

      await this.adminModel.model.findByIdAndUpdate(admin._id, { password: hashedPw }, { new: true });

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'ADMIN_RESET_PASSWORD_BY_SUPER_ADMIN',
        JSON.stringify({
          adminId: admin._id,
          username: admin.username,
          email: admin.email,
        }),
      );
    } catch (error) {
      throw new BadRequestException(`Error while reset password: ${error.message}`);
    }
  }

  async unlockOrganizationAccount(user: IJwtPayload, organizationId: string): Promise<void> {
    try {
      const account = await this.organizationModel.findById(organizationId);

      if (!account) {
        throw new BadRequestException('Account not found with this email');
      }

      await this.organizationModel.model.findByIdAndUpdate(
        account._id,
        { isLocked: false, loginAttempts: 0 },
        { new: true },
      );

      const tenantDoc = await this.tenantModel.model.findById(account.tenantId);
      if (tenantDoc) {
        const tenantDbName = `tenant_${tenantDoc.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
        await this.logService.createTenantLog(
          tenantDbName,
          user.username,
          user.role,
          'ORGANIZATION_ACCOUNT_UNLOCKED',
          JSON.stringify({
            organizationId: account._id.toString(),
            email: account.email,
          }),
        );
      }
    } catch (error) {
      throw new BadRequestException(`Error while unlock account: ${error.message}`);
    }
  }

  async generateAccessToken(_id: string, username: string, role: string): Promise<string> {
    return await this.jwtService.signAsync(
      { _id, username, role },
      {
        expiresIn: '1h',
      },
    );
  }

  async generateRefreshToken(_id: string, username: string, role: string): Promise<string> {
    const payload = { _id, username, role };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get('app.auth.jwtRefreshSecret'),
      expiresIn: '7d',
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.auth.jwtRefreshSecret'),
      });

      const newAccessToken = await this.generateAccessToken(payload._id, payload.username, payload.role);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new BadRequestException(`Error while refresh token: ${error.message}`);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async verifyOtp(
    accountId: string | Types.ObjectId,
    accountType: ERole,
    otp: string,
    type: OtpType,
  ): Promise<boolean> {
    try {
      const otpDoc = await this.otpModel.model
        .findOne({
          accountId,
          accountType,
          otp,
          type,
          expiresAt: { $gt: new Date() },
          isUsed: false,
        })
        .lean();

      if (!otpDoc) {
        return false;
      }

      await this.otpModel.model.updateOne({ _id: otpDoc._id }, { isUsed: true }, { new: true });

      return true;
    } catch (error) {
      throw new BadRequestException(`Error verifying OTP: ${error.message}`);
    }
  }

  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; accountId?: string; accountType?: string }> {
    try {
      const verification = await this.otpModel.model.findOne({
        verificationToken: token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
        type: OtpType.RESET_PASSWORD,
      });

      if (!verification) {
        return { valid: false };
      }

      return {
        valid: true,
        accountId: verification.accountId.toString(),
        accountType: verification.accountType,
      };
    } catch (error) {
      throw new BadRequestException(`Error verifying reset token: ${error.message}`);
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OtpModel } from 'modules/shared/models/otp.model';

import * as crypto from 'crypto';
import { Types } from 'mongoose';
import { ERole } from 'modules/shared/enums/auth.enum';
import { OtpType } from 'modules/shared/enums/otp.enum';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly otpModel: OtpModel,
  ) {}

  // Template helpers
  private getEmailTemplate(templateType: string, data: any): string {
    const templates = {
      organizationInvite: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${this.configService.get('app.logo')}" alt="Logo" style="max-height: 60px;">
          </div>
          <h2 style="color: #333; text-align: center;">Organization Account Information</h2>
          <p>Hello,</p>
          <p>Your organization account has been created successfully. Below are your login details:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>URL:</strong> <a href="${data.url}" style="color: #007bff;">${data.url}</a></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${data.password}</p>
          </div>
          <p>Please change your password immediately after your first login.</p>
          <p>Best regards,</p>
          <p>Certificate Management System Team</p>
          <div style="font-size: 12px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #e4e4e4; padding-top: 10px;">
            This is an automated email. Please do not reply to this message.
          </div>
        </div>
      `,

      otpVerification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${this.configService.get('app.logo')}" alt="Logo" style="max-height: 60px;">
          </div>
          <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f8f9fa; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff; margin: 0;">${data.otp}</h1>
          </div>
          <p>This code will expire in ${data.expiryMinutes} minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Best regards,</p>
          <p>Certificate Management System Team</p>
          <div style="font-size: 12px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #e4e4e4; padding-top: 10px;">
            This is an automated email. Please do not reply to this message.
          </div>
        </div>
      `,

      emailVerification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${this.configService.get('app.logo')}" alt="Logo" style="max-height: 60px;">
          </div>
          <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
          <p>Hello,</p>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${data.verifyUrl}</p>
          <p>This link will expire in ${data.expiryHours} hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Best regards,</p>
          <p>Certificate Management System Team</p>
          <div style="font-size: 12px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #e4e4e4; padding-top: 10px;">
            This is an automated email. Please do not reply to this message.
          </div>
        </div>
      `,

      passwordReset: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${this.configService.get('app.logo')}" alt="Logo" style="max-height: 60px;">
          </div>
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${data.resetUrl}</p>
          <p>This link will expire in ${data.expiryHours} hours.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,</p>
          <p>Certificate Management System Team</p>
          <div style="font-size: 12px; color: #666; margin-top: 30px; text-align: center; border-top: 1px solid #e4e4e4; padding-top: 10px;">
            This is an automated email. Please do not reply to this message.
          </div>
        </div>
      `,
    };

    return templates[templateType] || '';
  }

  // Gửi thông tin tài khoản cho tổ chức
  async sendOrganizationCredentials(email: string, subdomain: string, password: string) {
    const domain = this.configService.get('app.domain');
    const url = `https://${subdomain}.${domain}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Organization Account Details',
      html: this.getEmailTemplate('organizationInvite', {
        url,
        email,
        password,
      }),
    });
  }

  // Gửi email xác minh với link
  async sendEmailVerification(email: string, accountId: string, accountType: ERole): Promise<string> {
    try {
      // Tạo token xác minh
      const token = crypto.randomBytes(32).toString('hex');

      // Tính thời gian hết hạn (24 giờ)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Lưu token vào database
      await this.otpModel.model.create({
        accountId,
        accountType,
        verificationToken: token,
        otp: '', // Không cần OTP cho loại xác minh này
        expiresAt,
        type: OtpType.EMAIL_VERIFICATION,
      });

      // Tạo URL xác minh
      const baseUrl = this.configService.get('app.baseUrl');
      const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

      // Gửi email
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getEmailTemplate('emailVerification', {
          verifyUrl,
          expiryHours: 24,
        }),
      });

      return token;
    } catch (error) {
      throw new BadRequestException(`Error sending verification email: ${error.message}`);
    }
  }

  // Xác minh email qua token
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const verification = await this.otpModel.model.findOne({
        verificationToken: token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
        type: OtpType.EMAIL_VERIFICATION,
      });

      if (!verification) {
        return false;
      }

      // Đánh dấu đã sử dụng
      await this.otpModel.model.updateOne({ _id: verification._id }, { isUsed: true });

      return true;
    } catch (error) {
      throw new BadRequestException(`Error verifying email: ${error.message}`);
    }
  }

  // Gửi link đặt lại mật khẩu
  async sendPasswordResetLink(email: string, accountId: string, accountType: ERole): Promise<string> {
    try {
      // Tạo token đặt lại mật khẩu
      const token = crypto.randomBytes(32).toString('hex');

      // Tính thời gian hết hạn (1 giờ)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Lưu token vào database
      await this.otpModel.model.create({
        accountId,
        accountType,
        verificationToken: token,
        otp: '', // Không cần OTP cho loại xác minh này
        expiresAt,
        type: OtpType.FORGOT_PASSWORD,
      });

      // Tạo URL đặt lại mật khẩu
      const baseUrl = this.configService.get('app.baseUrl');
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      // Gửi email
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password',
        html: this.getEmailTemplate('passwordReset', {
          resetUrl,
          expiryHours: 1,
        }),
      });

      return token;
    } catch (error) {
      throw new BadRequestException(`Error sending password reset email: ${error.message}`);
    }
  }

  // Xác minh token đặt lại mật khẩu
  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; accountId?: string; accountType?: string }> {
    try {
      const verification = await this.otpModel.model.findOne({
        verificationToken: token,
        expiresAt: { $gt: new Date() },
        isUsed: false,
        type: OtpType.FORGOT_PASSWORD,
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

  // Tạo và gửi OTP
  async generateAndSendOtp(
    email: string,
    accountId: string | Types.ObjectId,
    accountType: ERole,
    type: OtpType = OtpType.FORGOT_PASSWORD,
  ): Promise<void> {
    try {
      // Tạo OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Tính thời gian hết hạn (15 phút)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Xóa OTP cũ cùng loại
      await this.otpModel.model.deleteMany({
        accountId,
        accountType,
        type,
      });

      // Lưu OTP mới vào database
      await this.otpModel.model.create({
        accountId,
        accountType,
        otp,
        expiresAt,
        type,
      });

      // Gửi email chứa OTP
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your Verification Code',
        html: this.getEmailTemplate('otpVerification', {
          otp,
          expiryMinutes: 15,
        }),
      });
    } catch (error) {
      throw new BadRequestException(`Error generating OTP: ${error.message}`);
    }
  }

  // Xác minh OTP
  async verifyOtp(
    accountId: string | Types.ObjectId,
    accountType: ERole,
    otp: string,
    type: OtpType = OtpType.FORGOT_PASSWORD,
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

      // Đánh dấu OTP đã sử dụng
      await this.otpModel.model.updateOne({ _id: otpDoc._id }, { isUsed: true });

      return true;
    } catch (error) {
      throw new BadRequestException(`Error verifying OTP: ${error.message}`);
    }
  }

  // Gửi lại OTP
  async resendOtp(
    email: string,
    accountId: string | Types.ObjectId,
    accountType: ERole,
    type: OtpType = OtpType.FORGOT_PASSWORD,
  ): Promise<void> {
    try {
      // Tìm OTP gần nhất của cùng loại
      const lastOtp = await this.otpModel.model
        .findOne({
          accountId,
          accountType,
          type,
        })
        .sort({ createdAt: -1 })
        .lean();

      if (lastOtp) {
        const currentTime = new Date();

        // Sử dụng kiểu any để bỏ qua kiểm tra kiểu dữ liệu TypeScript
        const lastCreatedTime = (lastOtp as any).createdAt;

        // const lastCreatedTime = lastOtp.createdAt;

        if (lastCreatedTime) {
          const timeDiff = currentTime.getTime() - new Date(lastCreatedTime).getTime();

          if (timeDiff < 60000) {
            // 60000ms = 1 phút
            throw new BadRequestException('Please wait 1 minute before requesting a new verification code');
          }
        }
      }

      await this.generateAndSendOtp(email, accountId, accountType, type);
    } catch (error) {
      throw new BadRequestException(`Error resending OTP: ${error.message}`);
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserModel } from 'modules/shared/models/superAdmin.model';
import { ConfigService } from '@nestjs/config';
import { OtpModel } from 'modules/shared/models/otp.model';
import eConfirmationSignUp from 'modules/shared/utils/eConfirmationSignUp';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly otpModel: OtpModel,
  ) {}

  async _sendMailConfirmationSignUp(email: string, fullName: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: {
        name: 'ABC',
        address: 'abc@domain.vn',
      },
      subject: 'abc',
      html: eConfirmationSignUp(fullName),
    });
  }

  async sendOrganizationCredentials(email: string, subdomain: string, password: string) {
    const domain = this.configService.get('app.domain');
    const url = `https://${subdomain}.${domain}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Organization Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thông tin tài khoản tổ chức của bạn</h2>
          <p>Xin chào,</p>
          <p>Tài khoản tổ chức của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
          <ul>
            <li>URL: <a href="${url}">${url}</a></li>
            <li>Email: ${email}</li>
            <li>Mật khẩu: ${password}</li>
          </ul>
          <p>Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ</p>
        </div>
      `,
    });
  }

  async generateAndSendOtp(email: string, userId: string): Promise<void> {
    try {
      // Tạo OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Tính thời gian hết hạn (15 phút)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Xóa OTP cũ nếu có
      await this.otpModel.model.deleteMany({ userId });

      // Lưu OTP mới vào database
      await this.otpModel.create({
        userId,
        otp,
        expiresAt,
        type: 'FORGOT_PASSWORD',
      });

      // Gửi email chứa OTP
      await this.mailerService.sendMail({
        to: email,
        subject: 'Mã xác thực OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Mã xác thực OTP của bạn</h2>
            <p>Xin chào,</p>
            <p>Mã OTP của bạn là: <strong style="font-size: 20px; color: #007bff;">${otp}</strong></p>
            <p>Mã này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ</p>
          </div>
        `,
      });
    } catch (error) {
      throw new BadRequestException(`Error generating OTP: ${error.message}`);
    }
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    try {
      const otpDoc = await this.otpModel.model.findOne({
        userId,
        otp,
        expiresAt: { $gt: new Date() },
      });

      if (!otpDoc) {
        return false;
      }

      // Xóa OTP đã sử dụng
      await this.otpModel.model.deleteOne({ _id: otpDoc._id });

      return true;
    } catch (error) {
      throw new BadRequestException(`Error verifying OTP: ${error.message}`);
    }
  }

  async resendOtp(userId: string, email: string): Promise<void> {
    try {
      // Kiểm tra thời gian gửi lại (ít nhất 1 phút giữa các lần gửi)
      const lastOtp = await this.otpModel.model.findOne({ userId }).sort({ createdAt: -1 });

      if (lastOtp) {
        const timeDiff = Date.now() - lastOtp.createdAt.getTime();
        if (timeDiff < 60000) {
          // 60000ms = 1 phút
          throw new BadRequestException('Please wait 1 minute before requesting a new OTP');
        }
      }

      await this.generateAndSendOtp(email, userId);
    } catch (error) {
      throw new BadRequestException(`Error resending OTP: ${error.message}`);
    }
  }
}

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ForgotPasswordDto, LoginRequestDto, RefreshTokenRequestDto } from './dtos/request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'modules/shared/models/user.model';
import { AdminModel } from 'modules/shared/models/admin.model';
import { ConfigService } from '@nestjs/config';
import { ERole } from 'modules/shared/enums/auth.enum';
import { OtpModel } from 'modules/shared/models/otp.model';
import { LoginResponseDto } from './dtos/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userModel: UserModel,
    private readonly adminModel: AdminModel,
    private readonly configService: ConfigService,
    private readonly otpModel: OtpModel,
  ) {}

  async onModuleInit() {
    const countAdmins = await this.adminModel.model.countDocuments();

    if (countAdmins <= 0) {
      const password = this.configService.get('admin.password');
      const createdAdmin = new this.adminModel.model({
        userName: this.configService.get('admin.username'),
        password: await this.hashPassword(password),
        role: ERole.ADMIN,
      });

      await createdAdmin.save();
    }
  }

  async generateTokens(
    _id: string,
    username: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { _id, username, role };

    const accessToken = await this.jwtService.signAsync({ _id, username, role });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenRequestDto): Promise<string> {
    const { refreshToken } = refreshTokenDto;
    const user = await this.userModel.model.findOne({ refreshToken });

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const payload = this.jwtService.verify(refreshToken);
    const newAccessToken = this.jwtService.sign({ _id: payload._id, role: payload.role });

    return newAccessToken;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async loginUser(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const userToken = await this._userLogin(loginDto);
    if (userToken)
      return {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        avatarUrl: userToken.avatarUrl,
      };

    throw new BadRequestException('Username or password is incorrect.');
  }

  async loginAdmin(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
    const adminToken = await this._adminLogin(loginDto);
    if (adminToken) return { accessToken: adminToken.accessToken, refreshToken: adminToken.refreshToken };

    throw new BadRequestException('Username or password is incorrect.');
  }

  async _userLogin(
    loginDto: LoginRequestDto,
  ): Promise<{ accessToken: string; refreshToken: string; avatarUrl: string }> {
    const user = await this.userModel.model.findOne({
      $or: [{ userName: loginDto.userName }, { email: loginDto.userName }],
    });
    if (!user) return null;

    const checkPw = await this.checkPassword(loginDto.password, user.password);
    if (!checkPw) return null;

    let avatarUrl = '';

    const tokens = await this.generateTokens(user._id.toString(), user.userName, user.role);
    if (!user.avatar) {
      avatarUrl = 'https://i.imgur.com/Uoeie1w.jpg';
    } else {
      avatarUrl = `${this.configService.get('BASE_URL')}/images/${user.avatar}`;
    }

    return { ...tokens, avatarUrl };
  }

  async _adminLogin(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { userName, password } = loginDto;
    const adminDoc = await this.adminModel.model.findOne({ userName: userName });
    if (!adminDoc) return null;

    const checkPw = await this.checkPassword(password, adminDoc.password);
    if (!checkPw) return null;

    const tokens = await this.generateTokens(adminDoc._id, userName, adminDoc.role);
    return tokens;
  }

  async forgotPassword(forgotPwDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userModel.model.findOne({ email: forgotPwDto.email });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const otpDoc = await this.otpModel.model.findOne({ userId: user._id, otp: forgotPwDto.otp });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const hashedPw = await this.hashPassword(forgotPwDto.newPassword);
    await this.userModel.model.findOneAndUpdate({ _id: user._id }, { password: hashedPw }, { new: true });

    await this.otpModel.model.deleteOne({ _id: otpDoc._id });
  }
}

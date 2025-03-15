import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  SuperAdminLoginRequestDto,
} from './dtos/request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminModel } from 'modules/shared/models/admin.model';
import { ConfigService } from '@nestjs/config';
import { ERole } from 'modules/shared/enums/auth.enum';
import { OtpModel } from 'modules/shared/models/otp.model';
import { LoginResponseDto } from './dtos/response.dto';
import { SuperAdminModel } from 'modules/shared/models/superAdmin.model';
import { OrganizationModel } from 'modules/shared/models/organization.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly superAdminModel: SuperAdminModel,
    private readonly adminModel: AdminModel,
    private readonly organizationModel: OrganizationModel,
    private readonly configService: ConfigService,
    private readonly otpModel: OtpModel,
  ) {}

  async onModuleInit() {
    const countSuperAdmins = await this.superAdminModel.model.countDocuments();

    if (countSuperAdmins <= 0) {
      const password = this.configService.get('admin.password');
      const createdSuperAdmin = new this.superAdminModel.model({
        userName: this.configService.get('admin.username'),
        password: await this.hashPassword(password),
        role: ERole.SUPER_ADMIN,
      });

      await createdSuperAdmin.save();
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
    const user = await this.superAdminModel.model.findOne({ refreshToken });

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

  async loginSuperAdmin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const superAdminToken = await this._superAdminLogin(loginDto);
    if (superAdminToken)
      return {
        accessToken: superAdminToken.accessToken,
        refreshToken: superAdminToken.refreshToken,
      };

    throw new BadRequestException('Username or password is incorrect.');
  }

  async loginAdmin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const adminToken = await this._adminLogin(loginDto);
    if (adminToken) return { accessToken: adminToken.accessToken, refreshToken: adminToken.refreshToken };

    throw new BadRequestException('Username or password is incorrect.');
  }

  async loginOrganization(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
    const organizationToken = await this._organizationLogin(loginDto);
    if (organizationToken)
      return { accessToken: organizationToken.accessToken, refreshToken: organizationToken.refreshToken };

    throw new BadRequestException('Username or password is incorrect.');
  }

  async _superAdminLogin(loginDto: SuperAdminLoginRequestDto): Promise<LoginResponseDto> {
    const superAdmin = await this.superAdminModel.model.findOne({
      $or: [{ userName: loginDto.userName }, { email: loginDto.userName }],
    });
    if (!superAdmin) return null;

    const checkPw = await this.checkPassword(loginDto.password, superAdmin.password);
    if (!checkPw) return null;

    const tokens = await this.generateTokens(superAdmin._id.toString(), superAdmin.userName, superAdmin.role);

    return { ...tokens };
  }

  async _adminLogin(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { userName, password } = loginDto;
    const adminDoc = await this.adminModel.model.findOne({
      $or: [{ email: userName }, { userName: userName }],
    });
    if (!adminDoc) return null;

    const checkPw = await this.checkPassword(password, adminDoc.password);
    if (!checkPw) return null;

    if (adminDoc.userName) {
      const tokens = await this.generateTokens(adminDoc._id, adminDoc.userName, adminDoc.role);
      return tokens;
    }

    const tokens = await this.generateTokens(adminDoc._id, adminDoc.email, adminDoc.role);
    return tokens;
  }

  async _organizationLogin(loginDto: LoginRequestDto): Promise<{ accessToken: string; refreshToken: string }> {
    const organizationDoc = await this.organizationModel.model.findOne({ userName: loginDto.userName });
    if (!organizationDoc) return null;

    const checkPw = await this.checkPassword(loginDto.password, organizationDoc.password);
    if (!checkPw) return null;

    let logoUrl = '';

    if (!organizationDoc.logo) {
      logoUrl = 'https://i.imgur.com/Uoeie1w.jpg';
    } else {
      logoUrl = `${this.configService.get('BASE_URL')}/images/${organizationDoc.logo}`;
    }

    const tokens = await this.generateTokens(organizationDoc._id, loginDto.userName, organizationDoc.role);
    return { ...tokens, logoUrl };
  }

  async forgotPassword(forgotPwDto: ForgotPasswordDto): Promise<void> {
    const user = await this.superAdminModel.model.findOne({ email: forgotPwDto.email });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const otpDoc = await this.otpModel.model.findOne({ userId: user._id, otp: forgotPwDto.otp });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP.');
    }

    const hashedPw = await this.hashPassword(forgotPwDto.newPassword);
    await this.superAdminModel.model.findOneAndUpdate({ _id: user._id }, { password: hashedPw }, { new: true });

    await this.otpModel.model.deleteOne({ _id: otpDoc._id });
  }
}

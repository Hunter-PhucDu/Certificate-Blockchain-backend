// import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import {
//   ForgotPasswordDto,
//   LoginRequestDto,
//   RefreshTokenRequestDto,
//   SuperAdminLoginRequestDto,
// } from './dtos/request.dto';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
// import { AdminModel } from 'modules/shared/models/admin.model';
// import { ConfigService } from '@nestjs/config';
// import { ERole } from 'modules/shared/enums/auth.enum';
// import { OtpModel } from 'modules/shared/models/otp.model';

// import { LoginResponseDto, OrganizationLoginResponseDto } from './dtos/response.dto';
// import { SuperAdminModel } from 'modules/shared/models/superAdmin.model';
// import { OrganizationModel } from 'modules/shared/models/organization.model';
// import { EmailService } from 'modules/email/email.service';
// import { OtpType } from 'modules/shared/enums/otp.enum';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly superAdminModel: SuperAdminModel,
//     private readonly adminModel: AdminModel,
//     private readonly organizationModel: OrganizationModel,
//     private readonly configService: ConfigService,
//     private readonly otpModel: OtpModel,
//     private readonly emailService: EmailService,
//   ) {}

//   async onModuleInit() {
//     const countSuperAdmins = await this.superAdminModel.model.countDocuments();

//     if (countSuperAdmins <= 0) {
//       const password = this.configService.get('admin.password');
//       const createdSuperAdmin = new this.superAdminModel.model({
//         userName: this.configService.get('admin.username'),
//         password: await this.hashPassword(password),
//         role: ERole.SUPER_ADMIN,
//       });

//       await createdSuperAdmin.save();
//     }
//   }

//   async generateTokens(
//     _id: string,
//     username: string,
//     role: string,
//   ): Promise<{ accessToken: string; refreshToken: string }> {
//     const payload = { _id, username, role };

//     const accessToken = await this.jwtService.signAsync({ _id, username, role });

//     const refreshToken = await this.jwtService.signAsync(payload, {
//       secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
//       expiresIn: '7d',
//     });
//     return { accessToken, refreshToken };
//   }

//   async refreshToken(refreshTokenDto: RefreshTokenRequestDto): Promise<string> {
//     const { refreshToken } = refreshTokenDto;

//     try {
//       // Verify the token
//       const payload = this.jwtService.verify(refreshToken, {
//         secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
//       });

//       // Find the user based on payload
//       let user;

//       if (payload.role === ERole.SUPER_ADMIN) {
//         user = await this.superAdminModel.model.findById(payload._id);
//       } else if (payload.role === ERole.ADMIN) {
//         user = await this.adminModel.model.findById(payload._id);
//       } else if (payload.role === ERole.ORGANIZATION) {
//         user = await this.organizationModel.model.findById(payload._id);
//       }

//       if (!user) {
//         throw new UnauthorizedException('Invalid token - User not found');
//       }

//       // Generate new access token
//       const newAccessToken = this.jwtService.sign({
//         _id: payload._id,
//         username: payload.username,
//         role: payload.role,
//       });

//       return newAccessToken;
//     } catch (error) {
//       throw new UnauthorizedException('Invalid or expired refresh token');
//     }
//   }

//   async hashPassword(password: string): Promise<string> {
//     const salt = await bcrypt.genSalt(10);
//     return await bcrypt.hash(password, salt);
//   }

//   async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
//     return await bcrypt.compare(password, hashedPassword);
//   }

//   async loginSuperAdmin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
//     const superAdminToken = await this._superAdminLogin(loginDto);
//     if (superAdminToken)
//       return {
//         accessToken: superAdminToken.accessToken,
//         refreshToken: superAdminToken.refreshToken,
//       };

//     throw new BadRequestException('Username or password is incorrect.');
//   }

//   async loginAdmin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
//     const { userName, password } = loginDto;

//     // Try as Super Admin first
//     const superAdmin = await this.superAdminModel.model.findOne({
//       $or: [{ userName }, { email: userName }],
//     });

//     if (superAdmin) {
//       const checkPw = await this.checkPassword(password, superAdmin.password);
//       if (checkPw) {
//         const tokens = await this.generateTokens(superAdmin._id.toString(), superAdmin.userName, superAdmin.role);
//         return tokens;
//       }
//     }

//     // Try as regular Admin
//     const admin = await this.adminModel.model.findOne({
//       $or: [{ userName }, { email: userName }],
//     });

//     if (admin) {
//       const checkPw = await this.checkPassword(password, admin.password);
//       if (checkPw) {
//         const tokens = await this.generateTokens(admin._id.toString(), admin.userName || admin.email, admin.role);
//         return tokens;
//       }
//     }

//     throw new BadRequestException('Invalid username or password');
//   }

//   async loginOrganization(loginDto: LoginRequestDto): Promise<OrganizationLoginResponseDto> {
//     const { userName, password } = loginDto;

//     const organization = await this.organizationModel.model.findOne({
//       $or: [{ email: userName }, { subdomain: userName }],
//     });

//     if (!organization) {
//       throw new BadRequestException('Invalid username or password');
//     }

//     const checkPw = await this.checkPassword(password, organization.password);
//     if (!checkPw) {
//       throw new BadRequestException('Invalid username or password');
//     }

//     let logoUrl = '';

//     if (!organization.logo) {
//       logoUrl = 'https://i.imgur.com/Uoeie1w.jpg';
//     } else {
//       logoUrl = `${this.configService.get('app.baseUrl')}/images/${organization.logo}`;
//     }

//     const tokens = await this.generateTokens(organization._id.toString(), organization.subdomain, organization.role);

//     return { ...tokens, logoUrl };
//   }

//   async _superAdminLogin(loginDto: SuperAdminLoginRequestDto): Promise<LoginResponseDto> {
//     const superAdmin = await this.superAdminModel.model.findOne({
//       $or: [{ userName: loginDto.userName }, { email: loginDto.userName }],
//     });
//     if (!superAdmin) return null;

//     const checkPw = await this.checkPassword(loginDto.password, superAdmin.password);
//     if (!checkPw) return null;

//     const tokens = await this.generateTokens(superAdmin._id.toString(), superAdmin.userName, superAdmin.role);

//     return { ...tokens };
//   }

//   async forgotPassword(forgotPwDto: ForgotPasswordDto): Promise<void> {
//     const user = await this.superAdminModel.model.findOne({ email: forgotPwDto.email });

//     if (!user) {
//       throw new BadRequestException('User not found.');
//     }

//     const otpDoc = await this.otpModel.model.findOne({ userId: user._id, otp: forgotPwDto.otp });

//     if (!otpDoc || otpDoc.expiresAt < new Date()) {
//       throw new BadRequestException('Invalid or expired OTP.');
//     }

//     const hashedPw = await this.hashPassword(forgotPwDto.newPassword);
//     await this.superAdminModel.model.findOneAndUpdate({ _id: user._id }, { password: hashedPw }, { new: true });

//     await this.otpModel.model.deleteOne({ _id: otpDoc._id });
//   }

//   // Find account by email and account type
//   private async findAccountByEmail(email: string, accountType: ERole): Promise<any> {
//     if (accountType === ERole.SUPER_ADMIN) {
//       return this.superAdminModel.model.findOne({ email });
//     } else if (accountType === ERole.ADMIN) {
//       return this.adminModel.model.findOne({ email });
//     } else if (accountType === ERole.ORGANIZATION) {
//       return this.organizationModel.model.findOne({ email });
//     }
//     return null;
//   }

//   // Generate OTP for email verification or password reset
//   async generateOtp(email: string, accountType: ERole): Promise<void> {
//     const account = await this.findAccountByEmail(email, accountType);

//     if (!account) {
//       throw new NotFoundException('Account not found with this email');
//     }

//     await this.emailService.generateAndSendOtp(email, account._id, accountType, OtpType.FORGOT_PASSWORD);
//   }

//   // Send password reset link or OTP based on preference
//   async sendPasswordReset(email: string, accountType: ERole): Promise<void> {
//     const account = await this.findAccountByEmail(email, accountType);

//     if (!account) {
//       throw new NotFoundException('Account not found with this email');
//     }

//     // Send password reset link (more modern approach)
//     await this.emailService.sendPasswordResetLink(email, account._id, accountType);
//   }

//   // Reset password with OTP method
//   async resetPasswordWithOtp(forgotPwDto: ForgotPasswordDto): Promise<void> {
//     const { email, otp, newPassword, accountType } = forgotPwDto;

//     const account = await this.findAccountByEmail(email, accountType);

//     if (!account) {
//       throw new NotFoundException('Account not found with this email');
//     }

//     // Verify OTP
//     const isValid = await this.emailService.verifyOtp(account._id, accountType, otp, OtpType.FORGOT_PASSWORD);

//     if (!isValid) {
//       throw new BadRequestException('Invalid or expired verification code');
//     }

//     // Hash new password
//     const hashedPw = await this.hashPassword(newPassword);

//     // Update password in appropriate collection
//     if (accountType === ERole.SUPER_ADMIN) {
//       await this.superAdminModel.model.findByIdAndUpdate(account._id, { password: hashedPw });
//     } else if (accountType === ERole.ADMIN) {
//       await this.adminModel.model.findByIdAndUpdate(account._id, { password: hashedPw });
//     } else if (accountType === ERole.ORGANIZATION) {
//       await this.organizationModel.model.findByIdAndUpdate(account._id, { password: hashedPw });
//     }
//   }

//   // Reset password with token from email
//   async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
//     const verification = await this.emailService.verifyPasswordResetToken(token);

//     if (!verification.valid) {
//       throw new BadRequestException('Invalid or expired reset link');
//     }

//     // Hash new password
//     const hashedPw = await this.hashPassword(newPassword);

//     // Update password based on account type
//     const accountType = verification.accountType as ERole;
//     const accountId = verification.accountId;

//     if (accountType === ERole.SUPER_ADMIN) {
//       await this.superAdminModel.model.findByIdAndUpdate(accountId, { password: hashedPw });
//     } else if (accountType === ERole.ADMIN) {
//       await this.adminModel.model.findByIdAndUpdate(accountId, { password: hashedPw });
//     } else if (accountType === ERole.ORGANIZATION) {
//       await this.organizationModel.model.findByIdAndUpdate(accountId, { password: hashedPw });
//     }

//     // Mark the token as used
//     await this.otpModel.model.updateOne({ verificationToken: token, type: OtpType.FORGOT_PASSWORD }, { isUsed: true });
//   }

//   // Send email verification link
//   async sendEmailVerification(email: string, accountType: ERole): Promise<void> {
//     const account = await this.findAccountByEmail(email, accountType);

//     if (!account) {
//       throw new NotFoundException('Account not found with this email');
//     }

//     await this.emailService.sendEmailVerification(email, account._id, accountType);
//   }
// }

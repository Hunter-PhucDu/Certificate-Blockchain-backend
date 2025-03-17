// import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
// import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
// import { AuthService } from './auth.service';
// import {
//   EmailVerificationDto,
//   ForgotPasswordDto,
//   GenerateOtpDto,
//   LoginRequestDto,
//   RefreshTokenRequestDto,
//   ResetPasswordDto,
//   VerifyEmailDto,
// } from './dtos/request.dto';
// import { AdminLoginResponseDto, LoginResponseDto } from './dtos/response.dto';
// import { ApiSuccessResponse } from 'modules/shared/decorators/api-success-response.decorator';
// import { EmailService } from 'modules/email/email.service';

// @Controller('auth')
// @ApiTags('Auth')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly emailService: EmailService,
//   ) {}

//   @Post('admin/sign-in')
//   @ApiOperation({
//     summary: 'Login for admin',
//     description: 'Login for admin',
//   })
//   @ApiSuccessResponse({ dataType: AdminLoginResponseDto })
//   async loginAdmin(@Body() loginDto: LoginRequestDto): Promise<AdminLoginResponseDto> {
//     return this.authService.loginAdmin(loginDto);
//   }

//   @Post('organization/sign-in')
//   @ApiOperation({
//     summary: 'Login for organization',
//     description: 'Login for organization',
//   })
//   @ApiSuccessResponse({ dataType: LoginResponseDto })
//   async loginOrganization(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
//     return this.authService.loginOrganization(loginDto);
//   }

//   @Post('generate-otp')
//   @ApiOperation({
//     summary: 'Generate OTP for email verification',
//     description: 'Send OTP to user email for verification',
//   })
//   async generateOtp(@Body() generateOtpDto: GenerateOtpDto): Promise<{ success: boolean; message: string }> {
//     await this.authService.generateOtp(generateOtpDto.email, generateOtpDto.accountType);
//     return {
//       success: true,
//       message: 'Verification code has been sent to your email',
//     };
//   }

//   @Post('forgot-password')
//   @ApiOperation({
//     summary: 'Request password reset',
//     description: 'Send password reset link or OTP based on preference',
//   })
//   @ApiBody({
//     description: 'Email and account type',
//     type: EmailVerificationDto,
//   })
//   async forgotPassword(@Body() emailDto: EmailVerificationDto): Promise<{ success: boolean; message: string }> {
//     await this.authService.sendPasswordReset(emailDto.email, emailDto.accountType);
//     return {
//       success: true,
//       message: 'Password reset instructions have been sent to your email',
//     };
//   }

//   @Post('reset-password-with-otp')
//   @ApiOperation({
//     summary: 'Reset password with OTP',
//     description: 'Reset password using email, OTP and new password',
//   })
//   async resetPasswordWithOtp(@Body() forgotPassDto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
//     await this.authService.resetPasswordWithOtp(forgotPassDto);
//     return {
//       success: true,
//       message: 'Password has been reset successfully',
//     };
//   }

//   @Get('verify-reset-token')
//   @ApiOperation({
//     summary: 'Verify password reset token',
//     description: 'Check if password reset token is valid',
//   })
//   @ApiQuery({ name: 'token', type: String })
//   async verifyResetToken(@Query('token') token: string): Promise<{ valid: boolean; accountType?: string }> {
//     const result = await this.emailService.verifyPasswordResetToken(token);
//     return {
//       valid: result.valid,
//       accountType: result.valid ? result.accountType : undefined,
//     };
//   }

//   @Post('reset-password')
//   @ApiOperation({
//     summary: 'Reset password with token',
//     description: 'Reset password using token from email link',
//   })
//   async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
//     await this.authService.resetPasswordWithToken(resetDto.token, resetDto.newPassword);
//     return {
//       success: true,
//       message: 'Password has been reset successfully',
//     };
//   }

//   @Post('verify-email')
//   @ApiOperation({
//     summary: 'Send email verification link',
//     description: 'Send email verification link to user',
//   })
//   async sendVerifyEmail(@Body() emailDto: EmailVerificationDto): Promise<{ success: boolean; message: string }> {
//     await this.authService.sendEmailVerification(emailDto.email, emailDto.accountType);
//     return {
//       success: true,
//       message: 'Verification link has been sent to your email',
//     };
//   }

//   @Get('verify-email')
//   @ApiOperation({
//     summary: 'Verify email with token',
//     description: 'Verify email using token from email link',
//   })
//   @ApiQuery({ name: 'token', type: String })
//   async verifyEmail(@Query('token') token: string): Promise<{ success: boolean; message: string }> {
//     const verified = await this.emailService.verifyEmail(token);
//     if (verified) {
//       return {
//         success: true,
//         message: 'Email verified successfully',
//       };
//     }
//     return {
//       success: false,
//       message: 'Invalid or expired verification link',
//     };
//   }

//   @Post('refresh-token')
//   @ApiOperation({ summary: 'Refresh access token' })
//   async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<{ accessToken: string }> {
//     const accessToken = await this.authService.refreshToken(refreshTokenDto);
//     return { accessToken };
//   }
// }

import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  OtpForgotPasswordRequestDto,
  RefreshTokenRequestDto,
  ResetPasswordLinkRequestDto,
  ResetPasswordByAdminRequestDto,
} from './dtos/request.dto';
import { LoginResponseDto, RefreshTokenResponseDto } from './dtos/response.dto';
import { ApiSuccessResponse } from 'modules/shared/decorators/api-success-response.decorator';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/sign-in')
  @ApiOperation({
    summary: 'Login for admin',
    description: 'Login for admin',
  })
  @ApiSuccessResponse({ dataType: LoginResponseDto })
  async loginAdmin(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('organization/sign-in')
  @ApiOperation({
    summary: 'Login for organization',
    description: 'Login for organization',
  })
  @ApiSuccessResponse({ dataType: LoginResponseDto })
  async loginOrganization(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.loginOrganization(loginDto);
  }

  @Post('get-otp-forgot-password')
  @ApiOperation({
    summary: 'Send OTP code with email',
    description: 'Send OTP to user email for forgot password',
  })
  async getOtpPwOrganization(@Body() otpForgotPasswordDto: OtpForgotPasswordRequestDto): Promise<void> {
    return await this.authService.getOtpForgotPasswordOrganization(otpForgotPasswordDto);
  }

  @Post('admin/get-otp-forgot-password')
  @ApiOperation({
    summary: 'Send OTP code with email',
    description: 'Send OTP to admin email for forgot password',
  })
  async getOtpPwAdmin(@Body() otpForgotPasswordDto: OtpForgotPasswordRequestDto): Promise<void> {
    return await this.authService.getOtpForgotPasswordAdmin(otpForgotPasswordDto);
  }

  @Post('/resend-otp-forgot-password')
  @ApiOperation({
    summary: 'Resend OTP code with email',
    description: 'Resend OTP to user email for forgot password',
  })
  async resendOtpPwOrganization(@Body() otpForgotPasswordDto: OtpForgotPasswordRequestDto): Promise<void> {
    return await this.authService.resendOtpForgotPasswordOrganization(otpForgotPasswordDto);
  }

  @Post('admin/resend-otp-forgot-password')
  @ApiOperation({
    summary: 'Resend OTP code with email',
    description: 'Resend OTP to admin email for forgot password',
  })
  async resendOtpPwAdmin(@Body() otpForgotPasswordDto: OtpForgotPasswordRequestDto): Promise<void> {
    return await this.authService.resendOtpForgotPasswordAdmin(otpForgotPasswordDto);
  }

  @Post('/send-link-reset-password')
  @ApiOperation({
    summary: 'Resend OTP code with email',
    description: 'Resend OTP to admin email for forgot password',
  })
  async sendLinkRsPwOrganization(@Body() forgotPasswordDto: ForgotPasswordRequestDto): Promise<void> {
    return await this.authService.sendLinkResetPasswordOrganization(forgotPasswordDto);
  }

  @Post('admin/send-link-reset-password')
  @ApiOperation({
    summary: 'Resend OTP code with email',
    description: 'Resend OTP to admin email for forgot password',
  })
  async sendLinkRsPwAdmin(@Body() forgotPasswordDto: ForgotPasswordRequestDto): Promise<void> {
    return await this.authService.sendLinkResetPasswordAdmin(forgotPasswordDto);
  }

  @Post('reset-password/:token')
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Reset password using token from email link',
  })
  async resetPasswordWithToken(
    @Body() resetPwDto: ResetPasswordLinkRequestDto,
    @Param('token') token: string,
  ): Promise<void> {
    return await this.authService.resetPasswordWithToken(token, resetPwDto);
  }

  @Post('organization/reset-password')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Reset password by admin',
    description: 'Reset password organization account by admin',
  })
  async resetPasswordOrganization(@Body() resetPwOrganizationDto: ResetPasswordByAdminRequestDto): Promise<void> {
    return await this.authService.resetPasswordOrganizationByAdmin(resetPwOrganizationDto);
  }

  @Post('admin/reset-password')
  @Roles([ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Reset password by super admin',
    description: 'Reset password admin account by super admin',
  })
  async resetPasswordAdmin(@Body() resetPwOrganizationDto: ResetPasswordByAdminRequestDto): Promise<void> {
    return await this.authService.resetPasswordOrganizationByAdmin(resetPwOrganizationDto);
  }

  @Put('unlock-account/:organizationId')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Unlock account by admin',
    description: 'Unlock organization account by admin',
  })
  async unlockAccoutOrganization(
    @Param('organizationId', new ValidateObjectId()) organizationId: string,
  ): Promise<void> {
    return await this.authService.unlockOrganizationAccount(organizationId);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto);
  }
}

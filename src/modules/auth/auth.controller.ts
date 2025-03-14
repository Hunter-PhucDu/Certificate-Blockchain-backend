import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, GenerateOtpDto, LoginRequestDto, RefreshTokenRequestDto } from './dtos/request.dto';
import { AdminLoginResponseDto, LoginResponseDto } from './dtos/response.dto';
import { ApiSuccessResponse } from 'modules/shared/decorators/api-success-response.decorator';
import { EmailService } from 'modules/email/email.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  userService: any;
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Post('admin/sign-in')
  @ApiOperation({
    summary: 'Login for admin',
    description: 'Login for admin',
  })
  @ApiSuccessResponse({ dataType: AdminLoginResponseDto })
  async loginAdmin(@Body() loginDto: LoginRequestDto): Promise<AdminLoginResponseDto> {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('user/sign-in')
  @ApiOperation({
    summary: 'Login for user',
    description: 'Login for user',
  })
  @ApiSuccessResponse({ dataType: LoginResponseDto })
  async loginUser(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.loginUser(loginDto);
  }

  @Post('generate-otp')
  @ApiOperation({
    summary: 'Creat opt for forgot password',
    description: 'Creat opt for forgot password',
  })
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto): Promise<void> {
    return this.emailService.generateOtp(generateOtpDto.email);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Change password with otp code',
  })
  @ApiBody({
    description: 'Change password with otp code',
    type: ForgotPasswordDto,
  })
  async forgotPassword(@Body() forgotPassDto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgotPassDto);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<string> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}

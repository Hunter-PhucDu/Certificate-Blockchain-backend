import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsEmailOrPhone } from 'modules/shared/decorators/is-email-or-phone.decorator';

@Exclude()
export class LoginRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    description: 'email or phone number',
    example: 'abc@gmail.com',
  })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  userName: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '******',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MinLength(6, {
    message: 'Password is too short. Minimum length is 6 characters.',
  })
  password: string;
}

@Exclude()
export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'currentPassword' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'newPassword' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

@Exclude()
export class GenerateOtpDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'abc@gmail.com',
  })
  @IsNotEmpty()
  @IsEmailOrPhone({
    message: 'Email is not valid',
  })
  @Transform(({ value }) => value?.trim())
  email: string;
}

@Exclude()
export class ForgotPasswordDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'abc@gmail.com',
  })
  @IsNotEmpty()
  @IsEmailOrPhone({
    message: 'Email is not valid',
  })
  @Transform(({ value }) => value?.trim())
  email: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    required: true,
    type: String,
    example: 'newPassword',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

@Exclude()
export class RefreshTokenRequestDto {
  @ApiProperty({ example: 'refreshToken' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

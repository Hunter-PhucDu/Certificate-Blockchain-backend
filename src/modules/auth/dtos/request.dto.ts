import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { IsEmailOrPhone } from 'modules/shared/decorators/is-email-or-phone.decorator';

@Exclude()
export class BaseRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'abc.example@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmailOrPhone({
    message: 'Email is not valid',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  email: string;
}

@Exclude()
export class LoginRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'abc.example@gmail.com',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  username: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '******',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MinLength(6, {
    message: 'Password is too short. Minimum length is 6 characters.',
  })
  password: string;
}

@Exclude()
export class ChangePasswordRequestDto {
  @Expose()
  @ApiProperty({ example: 'currentPassword' })
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
export class OtpForgotPasswordRequestDto extends BaseRequestDto {}

@Exclude()
export class ForgotPasswordRequestDto extends BaseRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;
}
@Exclude()
export class ResetPasswordLinkRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'newPassword',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[^\s]*$/, {
    message: 'Password should not contain spaces.',
  })
  newPassword: string;
}

@Exclude()
export class ResetPasswordByAdminRequestDto extends BaseRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'newPassword',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[^\s]*$/, {
    message: 'Password should not contain spaces.',
  })
  newPassword: string;
}

@Exclude()
export class RefreshTokenRequestDto {
  @Expose()
  @ApiProperty({ required: true, type: String, example: '0xabcd123' })
  @IsNotEmpty()
  refreshToken: string;
}

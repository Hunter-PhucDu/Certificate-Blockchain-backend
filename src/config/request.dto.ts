import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { IsEmailOrPhone } from 'modules/shared/decorators/is-email-or-phone.decorator';
import { ESex } from 'modules/shared/enums/sex.enum';

@Exclude()
export class SSignUpRequestDto {
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: any;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'VanA123',
  })
  @IsNotEmpty()
  userName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'Nguyen Van A',
  })
  @IsNotEmpty()
  fullName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '0378886868',
  })
  @IsNotEmpty()
  @IsEmailOrPhone({
    message: 'Phone number is not valid (VN)',
  })
  @Transform(({ value }) => value?.trim())
  phone: string;

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

  @ApiProperty({ enum: ESex, default: ESex.FEMALE })
  @Expose()
  @IsNotEmpty()
  @IsEnum(ESex)
  sex: ESex;

  @Expose()
  @ApiProperty({
    required: true,
    type: Date,
    example: '1/1/2000',
  })
  @IsNotEmpty()
  dateOfBirth: Date;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '******',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[^\s]*$/, {
    message: 'Password should not contain spaces.',
  })
  password: string;
}
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
  username: string;

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

export class LogOutRequestDto {
  @ApiProperty({ example: 'userId' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  _id: string;
}

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

export class RefreshTokenRequestDto {
  @ApiProperty({ example: 'refreshToken' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { IsEmailOrPhone } from '../../../modules/shared/decorators/is-email-or-phone.decorator';
import { PaginationDto } from '../../../modules/shared/dtos/pagination.dto';
import { IsPhone } from 'modules/shared/decorators/is-phone.docorator';

@Exclude()
export class AddUserRequestDto {
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
    example: '0371234567',
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
    example: 'Truong Dai hoc ABC',
  })
  @IsNotEmpty()
  organizationName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'Duong ABC, Quan ABC, TP ABC',
  })
  @IsNotEmpty()
  address: string;

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
export class UpdateUserRequestDto {
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  avatar?: any;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '0371234567',
  })
  @IsOptional()
  @IsPhone({
    message: 'Phone number is not valid (VN)',
  })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: 'abc123@gmail.com',
  })
  @IsOptional()
  @IsEmailOrPhone({
    message: 'Email is not valid',
  })
  @Transform(({ value }) => value?.trim())
  email?: string;
}

@Exclude()
export class ChangePasswordRequestDto {
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
  oldPassword: string;

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
  newPassword: string;
}

@Exclude()
export class GetUsersRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    description: 'Search pattern by organization name or email',
  })
  @IsOptional()
  search?: string;
}

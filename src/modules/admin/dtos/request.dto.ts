import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { IsEmailOrPhone } from 'modules/shared/decorators/is-email-or-phone.decorator';
import { PaginationDto } from 'modules/shared/dtos/pagination.dto';

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
export class AddAdminRequestDto extends BaseRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'VanA123',
  })
  @IsNotEmpty()
  username: string;

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
export class UpdateAdminRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'VanA123',
  })
  @IsOptional()
  username: string;
}

@Exclude()
export class GetAdminsRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    description: 'Search pattern by username or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
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
  password: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '******',
  })
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MinLength(6)
  @Matches(/^[^\s]*$/, {
    message: 'Password should not contain spaces.',
  })
  newPassword: string;
}

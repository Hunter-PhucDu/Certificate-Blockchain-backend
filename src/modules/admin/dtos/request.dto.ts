import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

@Exclude()
export class AddAdminRequestDto {
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
  @Matches(/^[^\s]*$/, {
    message: 'Password should not contain spaces.',
  })
  Communication;
  newPassword: string;
}

@Exclude()
export class ForgotPasswordAdminDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'admin',
  })
  @IsNotEmpty()
  userName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'newPassword',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

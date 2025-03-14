import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ERank } from 'modules/shared/enums/status.enum';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'User avatar',
  })
  avatar: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Nguyen Van A',
  })
  @Expose()
  userName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Nguyen Van A',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '0378886868',
  })
  @Expose()
  phone: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'abc@gmail.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'male',
  })
  @Expose()
  sex: string;

  @ApiProperty({
    type: Date,
    required: true,
    example: '07/11/3001',
  })
  @Expose()
  dateOfBirth: Date;

  @ApiProperty({
    type: Number,
    required: true,
    example: 0,
  })
  @Expose()
  experiencePoints: number;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Sắt',
  })
  @Expose()
  rank: ERank;

  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-05T16:40:14.532+00:00',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-05T16:40:14.532+00:00',
  })
  @Expose()
  updatedAt: Date;
}

export class ChangePasswordResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Password changed successfully',
  })
  @Expose()
  message: string;
}

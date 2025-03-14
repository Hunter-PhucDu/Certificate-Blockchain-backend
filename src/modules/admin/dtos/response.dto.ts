import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Admin2',
  })
  @Expose()
  userName: string;

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

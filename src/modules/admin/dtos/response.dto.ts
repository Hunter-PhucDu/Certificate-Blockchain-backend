import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '1234567890abcdef12345678',
  })
  id: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: 'Admin123',
  })
  username: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: 'example@gmail.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
  })
  role: string;

  @Expose()
  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-05T16:40:14.532+00:00',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-05T16:40:14.532+00:00',
  })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminResponseDto {
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

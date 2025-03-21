import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  token: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  refreshToken: string;
}

@Exclude()
export class RefreshTokenResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  accessToken: string;
}

@Exclude()
export class AdminResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'Admin123',
  })
  userName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '0345678901',
  })
  phone?: string;

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

// export class ChangePasswordResponseDto {
//   @ApiProperty({
//     type: String,
//     required: true,
//     example: 'Password changed successfully',
//   })
//   @Expose()
//   message: string;
// }

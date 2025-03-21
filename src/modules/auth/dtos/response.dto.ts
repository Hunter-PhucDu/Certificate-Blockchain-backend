import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  refreshToken: string;
}

@Exclude()
export class OrganizationLoginResponseDto extends LoginResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: 'https://i.imgur.com/Uoeie1w.jpg',
  })
  logoUrl?: string;
}

@Exclude()
export class RefreshTokenResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  accessToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Exclude()
export class LoginResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  accessToken: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '0x123...',
  })
  refreshToken: string;
}

@Exclude()
export class OrganizationLoginResponseDto extends LoginResponseDto {
  @ApiProperty({
    type: String,
    example: 'https://i.imgur.com/Uoeie1w.jpg',
  })
  logoUrl?: string;
}

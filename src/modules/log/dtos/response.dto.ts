import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ERole } from 'modules/shared/enums/auth.enum';

@Exclude()
export class LogResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: 'admin123',
  })
  username: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: 'CREATE_ADMIN',
  })
  action: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '{"adminId": "123", "username": "admin123"}',
  })
  payload: string;

  @Expose()
  @ApiProperty({
    enum: ERole,
    required: true,
    example: ERole.ADMIN,
  })
  role: ERole;

  @Expose()
  @ApiProperty({
    type: Date,
    required: true,
    example: '2024-01-05T16:40:14.532+00:00',
  })
  timestamp: Date;
}

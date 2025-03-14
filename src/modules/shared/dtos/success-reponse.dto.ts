import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class SuccessResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'ok',
  })
  code: string;
}

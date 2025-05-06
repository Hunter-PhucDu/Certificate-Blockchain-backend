import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'modules/shared/dtos/pagination.dto';

@Exclude()
export class GetLogsRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    description: 'Search pattern by username or action',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

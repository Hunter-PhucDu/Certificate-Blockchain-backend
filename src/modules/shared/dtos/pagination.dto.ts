import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PaginationDto {
  @Expose()
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    default: 1,
  })
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @Expose()
  @ApiPropertyOptional({
    type: Number,
    example: 10,
    default: 10,
  })
  @Transform(({ value }) => parseInt(value) || 10)
  size?: number;

  // @Expose()
  // @ApiPropertyOptional({
  //   type: String,
  //   example: 'createdAt',
  // })
  // orderBy?: string;

  // @Expose()
  // @ApiPropertyOptional({
  //   type: String,
  //   example: 'asc',
  // })
  // orderDirection?: string;
}

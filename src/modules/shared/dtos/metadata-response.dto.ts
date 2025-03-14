import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MetadataResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    description: 'size',
  })
  size: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'page',
  })
  page: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total items',
  })
  totalItem: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total pages',
  })
  totalPage: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: 'Has next pages',
  })
  hasNext: boolean;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: 'Has previous pages',
  })
  hasPrevious: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TenantResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    example: '1234567890abcdef12345678',
  })
  id: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'Organization Name',
  })
  organizationName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'teant_organiationA',
  })
  tenantName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'org-subdomain',
  })
  subdomain: string;

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

@Exclude()
export class TenantStatisticsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 10,
    description: 'Tổng số tenant',
  })
  totalTenants: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 8,
    description: 'Số tenant đang hoạt động',
  })
  activeTenants: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 2,
    description: 'Số tenant bị khóa',
  })
  suspendedTenants: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 5,
    description: 'Số tenant chưa được sử dụng',
  })
  unusedTenants: number;
}

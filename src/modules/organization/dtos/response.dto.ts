import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrganizationResponseDto {
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
    example: 'tenant_organiationA',
  })
  tenantId: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: 'https://example.com/logo.png',
  })
  logo?: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'Organization Name',
  })
  organizationName?: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'org@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '0909090909',
  })
  phone?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '123 Main St, VN',
  })
  address?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: Date,
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    required: false,
    type: Date,
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

@Exclude()
export class OrganizationStatisticsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
  })
  totalOrganizations: number;

  @Expose()
  @ApiProperty({
    type: Number,
  })
  organizationsWithout2FA: number;

  @Expose()
  @ApiProperty({
    type: Number,
  })
  lockedOrganizations: number;
}

@Exclude()
export class OrganizationMonthlyStatisticsResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
  })
  month: string;

  @Expose()
  @ApiProperty({
    type: Number,
  })
  count: number;
}

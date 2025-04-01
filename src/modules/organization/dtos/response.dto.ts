import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrganizationResponseDto {
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

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TenantResponseDto {
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

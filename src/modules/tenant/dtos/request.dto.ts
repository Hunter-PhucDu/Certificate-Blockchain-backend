import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { EStatus } from 'modules/shared/enums/status.enum';

@Exclude()
export class AddTenantRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'Organization Name',
  })
  @IsNotEmpty()
  organizationName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'utb',
  })
  @IsNotEmpty()
  tenantName: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'org-subdomain',
  })
  @IsNotEmpty()
  subdomain: string;
}

@Exclude()
export class UpdateTenantRequestDto {
  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: 'Organization Abc',
  })
  @IsOptional()
  organizationName?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    enum: EStatus,
    example: EStatus.ACTIVE,
  })
  @IsOptional()
  status?: EStatus;
}

@Exclude()
export class GetTenantsRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    description: 'Search by name, subdomain or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

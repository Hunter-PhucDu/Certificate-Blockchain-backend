import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { IsEmailOrPhone } from 'modules/shared/decorators/is-email-or-phone.decorator';

@Exclude()
export class AddOrganizationRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    example: '0x1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @Expose()
  @ApiProperty({
    required: true,
    example: 'Organization Name',
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @Expose()
  @ApiProperty({
    required: true,
    example: 'org@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '0909090909',
  })
  @IsEmailOrPhone()
  @IsOptional()
  phone?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '123 Main St, VN',
  })
  @IsOptional()
  address?: string;
}

@Exclude()
export class UpdateOrganizationRequestDto {
  @Expose()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  logo?: Express.Multer.File;

  @Expose()
  @ApiProperty({
    required: false,
    example: 'New Organization Name',
  })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '0909090909',
  })
  @IsEmailOrPhone()
  @IsOptional()
  phone?: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    example: '123 Main St, VN',
  })
  @IsOptional()
  address?: string;
}

@Exclude()
export class GetOrganizationsDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    description: 'Search by name, subdomain or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

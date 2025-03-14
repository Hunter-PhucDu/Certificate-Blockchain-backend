import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';

@Exclude()
export class CreateOrganizationDto {
  @Expose()
  @ApiProperty({
    required: true,
    example: 'Organization Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @ApiProperty({
    required: true,
    example: 'org-subdomain',
  })
  @IsString()
  @IsNotEmpty()
  subdomain: string;

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
    type: 'object',
    example: { field1: 'value1' },
  })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @Expose()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  logo?: Express.Multer.File;
}

@Exclude()
export class UpdateOrganizationDto extends CreateOrganizationDto {
  @Expose()
  @ApiProperty({
    required: false,
    example: 'New Organization Name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @Expose()
  @ApiProperty({
    required: false,
    example: 'new-subdomain',
  })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @Expose()
  @ApiProperty({
    required: false,
    example: 'new@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
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

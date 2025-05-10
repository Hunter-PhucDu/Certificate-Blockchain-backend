import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';

export class CertificateValueDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  label: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  value: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  type: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  isUnique: boolean;
}

export class CertificateDataDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsNotEmpty()
  key: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: () => CertificateValueDto,
  })
  @ValidateNested({ each: true })
  @Type(() => CertificateValueDto)
  values: CertificateValueDto[];
}

@Exclude()
export class BlockchainRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Type of the certificate',
    example: "Bachelor's degree",
  })
  @IsString()
  @IsNotEmpty()
  certificateType: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: () => CertificateDataDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CertificateDataDto)
  certificateData: CertificateDataDto[];
}

@Exclude()
export class CreateCertificateRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '660d46b09b4b6a001f841b1e',
  })
  @IsNotEmpty()
  groupId: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Type of the certificate',
    example: "Bachelor's degree",
  })
  @IsString()
  @IsNotEmpty()
  certificateType: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: () => CertificateDataDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CertificateDataDto)
  certificateData: CertificateDataDto[];
}

@Exclude()
export class UpdateCertificateDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: () => CertificateDataDto,
    isArray: true,
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CertificateDataDto)
  certificateData: CertificateDataDto[];
}

@Exclude()
export class GetCertificatesRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

@Exclude()
export class BulkCreateCertificateRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: '660d46b09b4b6a001f841b1e',
  })
  @IsNotEmpty()
  groupId: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Type of the certificate',
    example: "Bachelor's degree",
  })
  @IsString()
  @IsNotEmpty()
  certificateType: string;

  @Expose()
  @ApiProperty({
    required: true,
    type: () => [CertificateDataDto],
    isArray: true,
    description: 'List of certificate data objects, one for each certificate to create',
  })
  @ValidateNested({ each: true })
  @Type(() => CertificateDataDto)
  @ArrayMinSize(1)
  certificatesData: CertificateDataDto[][];
}

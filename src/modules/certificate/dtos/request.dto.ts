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
  isUnique?: boolean;
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
export class CertificateRequestDto {
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

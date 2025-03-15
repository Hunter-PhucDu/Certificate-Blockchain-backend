import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { EStatus } from '../../shared/enums/status.enum';

export class CertificateFieldDto {
  @ApiProperty({ example: 'Upon' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'PHAM VAN A' })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ example: true })
  @IsOptional()
  isUnique?: boolean;
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
    type: [CertificateFieldDto],
    example: [
      { key: 'Upon', value: 'PHAM VAN A' },
      { key: 'Serial number:', value: '2025AH00001' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CertificateFieldDto)
  certificateData: CertificateFieldDto[];
}

@Exclude()
export class UpdateCertificateDto {
  @Expose()
  @ApiProperty({
    type: [CertificateFieldDto],
    example: [
      { key: 'Upon', value: 'PHAM VAN A' },
      { key: 'Serial number:', value: '2025AH00001' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CertificateFieldDto)
  certificateData: CertificateFieldDto[];
}

@Exclude()
export class GetCertificatesRequestDto extends PaginationDto {
  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @Expose()
  @ApiProperty({ enum: EStatus, required: false })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}

@Exclude()
export class ValidateCertificateDto {
  @Expose()
  @ApiProperty({ example: '2025AH00001' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;
}

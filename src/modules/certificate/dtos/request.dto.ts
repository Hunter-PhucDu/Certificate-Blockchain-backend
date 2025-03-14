import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';
import { EStatus } from '../../shared/enums/status.enum';

export class CustomFieldDto {
  @ApiProperty({ example: 'Upon' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'PHAM VAN A' })
  @IsNotEmpty()
  value: any;
}

@Exclude()
export class AddCertificateRequestDto {
  @Expose()
  @ApiProperty({
    type: [CustomFieldDto],
    example: [
      { key: 'Upon', value: 'PHAM VAN A' },
      { key: 'Serial number:', value: '2025AH00001' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  customData: CustomFieldDto[];

  @Expose()
  @ApiProperty({ enum: EStatus, required: false })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}

@Exclude()
export class UpdateCertificateDto {
  @Expose()
  @ApiProperty({ enum: EStatus })
  @IsEnum(EStatus)
  @IsNotEmpty()
  status: EStatus;
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

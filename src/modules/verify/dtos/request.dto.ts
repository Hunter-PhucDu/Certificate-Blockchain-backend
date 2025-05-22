import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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
export class SearchCertificateByValueRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
    example: 'SN_0001',
  })
  @IsString()
  @IsNotEmpty()
  searchValue: string;
}

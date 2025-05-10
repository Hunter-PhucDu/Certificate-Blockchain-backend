import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CertificateDataDto } from './request.dto';

@Exclude()
export class CreateCertificateResponseDto {
  @Expose()
  @ApiProperty({ example: '6c8be540a58ab69a3c0ca7643428ae367d43632ab558b57b87f37be5d91048ea' })
  txId: string;
}

@Exclude()
export class CertificateResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  @ApiProperty({ example: '660d46b09b4b6a001f841b1e' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'block123' })
  blockId: string;

  @Expose()
  @ApiProperty({ example: '6c8be540a58ab69a3c0ca7643428ae367d43632ab558b57b87f37be5d91048ea' })
  txHash: string;

  @Expose()
  @Transform(({ value }) => (value ? value.toString() : value))
  @ApiProperty({ example: '660d46b09b4b6a001f841b1e' })
  groupId: string;

  @Expose()
  @ApiProperty({ example: "Bachelor's degree" })
  certificateType: string;

  @Expose()
  @ApiProperty({ type: [CertificateDataDto] })
  @Type(() => CertificateDataDto)
  certificateData: CertificateDataDto[];

  @Expose()
  @ApiProperty({ example: '2023-09-23T15:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2023-09-23T15:30:00.000Z' })
  updatedAt: Date;
}

@Exclude()
export class CertificateVerificationResponseDto {
  @Expose()
  @ApiProperty({ example: true })
  isValid: boolean;

  @Expose()
  @ApiProperty({ type: CertificateResponseDto, required: false })
  certificateData?: CertificateResponseDto;
}

@Exclude()
export class CertificateListResponseDto {
  @Expose()
  @ApiProperty({ type: [CertificateResponseDto] })
  items: CertificateResponseDto[];

  @Expose()
  @ApiProperty({ example: 100 })
  total: number;
}

@Exclude()
export class CertificateStatisticsResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 100,
  })
  totalCertificates: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 80,
  })
  confirmedCertificates: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: true,
    example: 20,
  })
  pendingCertificates: number;

  @Expose()
  @ApiProperty({
    type: [Object],
    required: true,
  })
  certificatesByType: {
    type: string;
    count: number;
  }[];
}

@Exclude()
export class BulkCreateCertificateResponseDto {
  @Expose()
  @ApiProperty({ example: '6c8be540a58ab69a3c0ca7643428ae367d43632ab558b57b87f37be5d91048ea' })
  txId: string;

  @Expose()
  @ApiProperty({ example: 10 })
  certificatesCount: number;

  @Expose()
  @ApiProperty({
    example: ['660d46b09b4b6a001f841b1e', '660d46b09b4b6a001f841b1f'],
    description: 'List of created certificate IDs in MongoDB',
  })
  certificateIds: string[];
}

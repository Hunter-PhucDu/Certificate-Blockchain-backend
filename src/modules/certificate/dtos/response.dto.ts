import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CertificateResponseDto {
  @Expose()
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  organizationId: string;

  @Expose()
  @ApiProperty({ example: '12345' })
  blockId: string;

  @Expose()
  @ApiProperty({ example: '0x1234...' })
  transactionHash: string;

  @Expose()
  @ApiProperty({
    example: {
      Upon: 'PHAM VAN A',
      'Serial number:': '2025AH00001',
      'Issue Date': '2024-03-14',
      'Expiry Date': '2025-03-14',
      'Certificate Type': 'Professional Certificate',
      Program: 'Software Engineering',
      Grade: 'Excellent',
    },
  })
  certificateData: Record<string, any>;

  @Expose()
  @ApiProperty({ example: '2024-03-14T10:30:00.000Z' })
  issuedDate: Date;

  @Expose()
  @ApiProperty({ example: '2024-03-14T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-03-14T10:30:00.000Z' })
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

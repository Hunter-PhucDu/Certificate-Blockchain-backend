import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

@Exclude()
export class CreateCertificateResponseDto {
  @Expose()
  @ApiProperty({ example: '6c8be540a58ab69a3c0ca7643428ae367d43632ab558b57b87f37be5d91048ea' })
  txId: string;
}

@Exclude()
export class CertificateResponseDto {
  @Expose()
  @ApiProperty({ example: '60b9b4f5f5b9f5b9f5b9f5b9' })
  @Transform(({ value }) => (value instanceof Types.ObjectId ? value.toString() : value))
  id: string;

  @Expose()
  @ApiProperty({ example: '8a09e4e9d34b2de93b7acd0d9bbea24b60fac11bccbba3945dcbd91c7418c1ce' })
  blockId: string;

  @Expose()
  @ApiProperty({ example: '6c8be540a58ab69a3c0ca7643428ae367d43632ab558b57b87f37be5d91048ea' })
  transactionHash: string;

  @Expose()
  @ApiProperty({ example: '60b9b4f5f5b9f5b9f5b9f5b9' })
  @Transform(({ value }) => (value instanceof Types.ObjectId ? value.toString() : value))
  groupId: string;

  @Expose()
  @ApiProperty({ example: "Bachelor's degree" })
  certificateType: string;

  @Expose()
  @ApiProperty({
    example: [
      {
        key: 'name',
        values: [
          {
            label: 'Họ tên',
            value: 'Nguyễn Văn A',
            type: 'string',
            isUnique: true,
          },
        ],
      },
    ],
  })
  certificateData: object[];

  @Expose()
  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  issuedDate: Date;

  @Expose()
  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
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

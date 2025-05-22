import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlockfrostService } from 'modules/blockchain/blockfrost.service';
import { SearchCertificateByValueRequestDto } from './dtos/request.dto';
import { CertificateResponseDto } from './dtos/response.dto';
import { REQUEST } from '@nestjs/core';
import { Certificate, CertificateSchema } from 'modules/shared/schemas/certificate.schema';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VerifyService {
  private get certificateModel(): Model<Certificate> {
    const tenantDb = this.request['tenantDb'];
    if (!tenantDb) {
      throw new BadRequestException('Tenant database not found');
    }
    return tenantDb.model<Certificate>('Certificate', CertificateSchema);
  }

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly blockfrostService: BlockfrostService,
  ) {}

  async getCertificateByTxHash(txHash: string): Promise<any> {
    try {
      const metadata = await this.blockfrostService.getTransactionMetadata(txHash);

      if (!metadata || metadata.length === 0) {
        throw new Error(`No metadata found for transaction: ${txHash}`);
      }
      return metadata;
    } catch (error) {
      throw new BadRequestException(`Error getting certificate by txHash: ${error.message}`);
    }
  }

  async getCertificateMetadataByTxHash(txHash: string, index?: number): Promise<any> {
    try {
      if (index !== undefined) {
        const metadata = await this.blockfrostService.getBulkTransactionMetadata(txHash, index);
        return {
          txHash,
          index,
          metadata,
        };
      }

      const metadata = await this.blockfrostService.getTransactionMetadata(txHash);
      return {
        txHash,
        metadata,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting certificate metadata: ${error.message}`);
    }
  }

  async searchCertificateByValue(searchValue: SearchCertificateByValueRequestDto): Promise<CertificateResponseDto[]> {
    try {
      const certificates = await this.certificateModel.find({
        'certificateData.values.value': searchValue.searchValue,
      });

      if (!certificates || certificates.length === 0) {
        throw new NotFoundException('Không tìm thấy chứng chỉ nào với giá trị này');
      }

      const plainObjects = certificates.map((cert) => cert.toObject());
      return plainToInstance(CertificateResponseDto, plainObjects);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi khi tìm kiếm chứng chỉ: ${error.message}`);
    }
  }
}

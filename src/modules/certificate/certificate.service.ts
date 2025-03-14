import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AddCertificateRequestDto, GetCertificatesRequestDto, UpdateCertificateDto } from './dtos/request.dto';
import { EStatus } from '../shared/enums/status.enum';
import { plainToInstance } from 'class-transformer';
import { CertificateModel } from 'modules/shared/models/certificate.model';
import { BlockchainService } from 'modules/blockchain/blockchain.service';
import { CertificateResponseDto } from './dtos/response.dto';

@Injectable()
export class CertificateService {
  constructor(
    private readonly certificateModel: CertificateModel,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createCertificate(
    createDto: AddCertificateRequestDto,
    organizationId: string,
  ): Promise<CertificateResponseDto> {
    try {
      // Kiểm tra trùng serial number
      const existingCert = await this.certificateModel.model.findOne({
        'customData.Serial number:': createDto.customData.find((f) => f.key === 'Serial number:')?.value,
        organizationId,
      });

      if (existingCert) {
        throw new BadRequestException('Certificate with this serial number already exists');
      }

      // Chuyển đổi customData array thành object
      const customDataObj = createDto.customData.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // Lưu lên blockchain
      const { blockId, transactionHash } = await this.blockchainService.storeCertificate(customDataObj);

      // Lưu vào MongoDB
      const certificate = await this.certificateModel.create({
        organizationId,
        blockId,
        transactionHash,
        customData: customDataObj,
        status: createDto.status || EStatus.ACTIVE,
        issuedDate: new Date(),
      });

      return plainToInstance(CertificateResponseDto, certificate.toObject());
    } catch (error) {
      throw new BadRequestException(`Error creating certificate: ${error.message}`);
    }
  }

  async getCertificates(
    query: GetCertificatesRequestDto,
    organizationId: string,
  ): Promise<{ items: CertificateResponseDto[]; total: number }> {
    try {
      const { page = 1, search, status } = query;
      const limit = 10;
      const skip = (page - 1) * limit;

      const filter: any = { organizationId };

      if (status) {
        filter.status = status;
      }

      if (search) {
        filter['$or'] = [
          { 'customData.Upon': { $regex: search, $options: 'i' } },
          { 'customData.Serial number:': { $regex: search, $options: 'i' } },
        ];
      }

      const [items, total] = await Promise.all([
        this.certificateModel.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        this.certificateModel.model.countDocuments(filter),
      ]);

      return {
        items: items.map((item) => plainToInstance(CertificateResponseDto, item)),
        total,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting certificates: ${error.message}`);
    }
  }

  async getCertificateById(id: string, organizationId: string): Promise<CertificateResponseDto> {
    const certificate = await this.certificateModel.model.findOne({
      _id: id,
      organizationId,
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return plainToInstance(CertificateResponseDto, certificate.toObject());
  }

  async updateCertificate(
    id: string,
    organizationId: string,
    updateDto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    const certificate = await this.certificateModel.model.findOne({
      _id: id,
      organizationId,
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    // Chỉ cho phép cập nhật status
    const updated = await this.certificateModel.model.findByIdAndUpdate(
      id,
      { status: updateDto.status },
      { new: true },
    );

    return plainToInstance(CertificateResponseDto, updated.toObject());
  }

  async verifyCertificate(blockId: string, transactionHash: string): Promise<boolean> {
    return this.blockchainService.verifyCertificate(blockId, transactionHash);
  }

  async validateCertificate(serialNumber: string): Promise<{
    isValid: boolean;
    certificateData?: CertificateResponseDto;
  }> {
    const certificate = await this.certificateModel.model.findOne({
      'customData.Serial number:': serialNumber,
      status: EStatus.ACTIVE,
    });

    if (!certificate) {
      return { isValid: false };
    }

    const isValid = await this.verifyCertificate(certificate.blockId, certificate.transactionHash);

    return {
      isValid,
      certificateData: isValid ? plainToInstance(CertificateResponseDto, certificate.toObject()) : undefined,
    };
  }
}

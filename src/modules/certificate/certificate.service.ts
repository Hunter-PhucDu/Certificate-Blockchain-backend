import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateRequestDto, GetCertificatesRequestDto, UpdateCertificateDto } from './dtos/request.dto';
import { plainToInstance } from 'class-transformer';
import { CertificateModel } from 'modules/shared/models/certificate.model';
import { BlockchainService } from 'modules/blockchain/blockchain.service';
import { CertificateResponseDto } from './dtos/response.dto';
import { Types } from 'mongoose';

@Injectable()
export class CertificateService {
  constructor(
    private readonly certificateModel: CertificateModel,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createCertificate(createDto: CertificateRequestDto, organizationId: string): Promise<CertificateResponseDto> {
    try {
      // Tách ra các trường unique và data
      const uniqueFields = createDto.certificateData.filter((field) => field.isUnique).map((field) => field.key);

      const customDataObj = createDto.certificateData.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // Tạo query kiểm tra trùng lặp cho các trường unique
      if (uniqueFields.length > 0) {
        const uniqueFieldsQuery = uniqueFields.map((field) => ({
          [`certificateData.${field}`]: customDataObj[field],
          organizationId,
        }));

        const existingCert = await this.certificateModel.model.findOne({
          $or: uniqueFieldsQuery,
        });

        if (existingCert) {
          // Xác định trường unique nào bị trùng
          const duplicateFields = uniqueFields.filter(
            (field) => existingCert.certificateData[field] === customDataObj[field],
          );

          throw new BadRequestException(`Certificate with duplicate unique fields: ${duplicateFields.join(', ')}`);
        }
      }

      // Lưu lên blockchain
      const { blockId, transactionHash } = await this.blockchainService.storeCertificate(customDataObj);

      // Lưu vào MongoDB
      const certificate = await this.certificateModel.create({
        organizationId: new Types.ObjectId(organizationId),
        blockId,
        transactionHash,
        certificateData: customDataObj,
        uniqueFields, // Lưu lại các trường unique để sử dụng sau này
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
    try {
      // 1. Tìm chứng chỉ cũ
      const existingCertificate = await this.certificateModel.model.findOne({
        _id: id,
        organizationId,
      });

      if (!existingCertificate) {
        throw new NotFoundException('Certificate not found');
      }

      // 2. Lưu phiên bản mới lên blockchain
      const { blockId, transactionHash } = await this.blockchainService.storeCertificate(updateDto.certificateData);

      // 3. Cập nhật bản ghi trong MongoDB với blockId và transactionHash mới
      const updatedCertificate = await this.certificateModel.model.findByIdAndUpdate(
        id,
        {
          blockId: blockId,
          transactionHash: transactionHash,
          certificateData: updateDto.certificateData,
          issuedDate: new Date(), // Có thể giữ nguyên ngày cũ: existingCertificate.issuedDate
        },
        { new: true },
      );

      return plainToInstance(CertificateResponseDto, updatedCertificate.toObject());
    } catch (error) {
      throw new BadRequestException(`Error updating certificate: ${error.message}`);
    }
  }

  async verifyCertificate(blockId: string, transactionHash: string): Promise<boolean> {
    return this.blockchainService.verifyCertificate(blockId, transactionHash);
  }

  async validateCertificate(searchCriteria: Record<string, any>): Promise<{
    isValid: boolean;
    certificateData?: CertificateResponseDto;
  }> {
    // Tìm chứng chỉ trong MongoDB dựa trên các trường unique
    const searchQuery = Object.entries(searchCriteria).reduce((acc, [key, value]) => {
      acc[`certificateData.${key}`] = value;
      return acc;
    }, {});

    const certificate = await this.certificateModel.model.findOne(searchQuery);

    if (!certificate) {
      return { isValid: false };
    }

    // Xác thực trên blockchain
    const isValid = await this.blockchainService.verifyCertificate(certificate.blockId, certificate.transactionHash);

    return {
      isValid,
      certificateData: isValid ? plainToInstance(CertificateResponseDto, certificate.toObject()) : undefined,
    };
  }
}

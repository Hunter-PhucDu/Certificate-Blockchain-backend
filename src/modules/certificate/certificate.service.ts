import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  BlockchainRequestDto,
  CreateCertificateRequestDto,
  GetCertificatesRequestDto,
  UpdateCertificateDto,
} from './dtos/request.dto';
import { BlockfrostService } from 'modules/blockchain/blockfrost.service';
import { Certificate } from '../shared/schemas/certificate.schema';
import { CertificateSchema } from '../shared/schemas/certificate.schema';
import { plainToInstance } from 'class-transformer';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { CertificateResponseDto, CertificateStatisticsResponseDto } from './dtos/response.dto';
import { GroupSchema } from '../shared/schemas/group.schema';
import { LogService } from '../log/log.service';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';

@Injectable()
export class CertificateService {
  private get certificateModel(): Model<Certificate> {
    const tenantDb = this.request['tenantDb'];
    if (!tenantDb) {
      throw new BadRequestException('Tenant database not found');
    }
    return tenantDb.model<Certificate>('Certificate', CertificateSchema);
  }

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly blockchainService: BlockchainService,
    private readonly blockfrostService: BlockfrostService,
    private readonly logService: LogService,
  ) {}

  async processCertificate(certificateData: BlockchainRequestDto): Promise<string> {
    const privateKey = await this.blockchainService.getPrivateKeyFromMnemonic();
    return await this.blockchainService.buildAndSignTransaction(certificateData, privateKey);
  }

  async createCertificate(
    user: IJwtPayload,
    createCertificateDto: CreateCertificateRequestDto,
  ): Promise<CertificateResponseDto> {
    try {
      const tenantDb = this.request['tenantDb'];
      const groupModel = tenantDb.model('Groups', GroupSchema);
      const group = await groupModel.findById(createCertificateDto.groupId);

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const plainCertificateData = JSON.parse(JSON.stringify(createCertificateDto.certificateData));

      const blockchainData: BlockchainRequestDto = {
        certificateType: createCertificateDto.certificateType,
        certificateData: plainCertificateData,
      };

      const txHash = await this.processCertificate(blockchainData);

      const certificateData = {
        groupId: createCertificateDto.groupId,
        certificateType: createCertificateDto.certificateType,
        certificateData: plainCertificateData,
        txHash,
        blockId: 'pending',
      };

      const certificate = new this.certificateModel(certificateData);
      const savedCertificate = await certificate.save();

      const tenantDbName = this.request['tenantDbName'];
      await this.logService.createTenantLog(
        tenantDbName,
        user.username,
        user.role,
        'CREATE_CERTIFICATE',
        JSON.stringify({
          certificateId: savedCertificate._id,
          certificateType: savedCertificate.certificateType,
          groupId: savedCertificate.groupId,
          txHash: savedCertificate.txHash,
        }),
      );

      const plainObject = savedCertificate.toObject();
      return plainToInstance(CertificateResponseDto, plainObject);
    } catch (error) {
      throw new BadRequestException(`Error creating certificate: ${error.message}`);
    }
  }

  async updateCertificate(
    user: IJwtPayload,
    id: string,
    updateDto: UpdateCertificateDto,
  ): Promise<CertificateResponseDto> {
    try {
      const certificate = await this.certificateModel.findById(id);

      if (!certificate) {
        throw new NotFoundException('Certificate not found');
      }

      const plainCertificateData = JSON.parse(JSON.stringify(updateDto.certificateData));

      const blockchainData: BlockchainRequestDto = {
        certificateType: certificate.certificateType,
        certificateData: plainCertificateData,
      };

      const txHash = await this.processCertificate(blockchainData);

      const certificateData = {
        groupId: certificate.groupId,
        certificateType: certificate.certificateType,
        certificateData: plainCertificateData,
        txHash,
        blockId: 'pending',
      };

      const newCertificate = new this.certificateModel(certificateData);
      const savedCertificate = await newCertificate.save();

      const tenantDbName = this.request['tenantDbName'];
      await this.logService.createTenantLog(
        tenantDbName,
        user.username,
        user.role,
        'UPDATE_CERTIFICATE',
        JSON.stringify({
          certificateId: id,
          newCertificateId: savedCertificate._id,
          certificateType: savedCertificate.certificateType,
          groupId: savedCertificate.groupId,
          txHash: savedCertificate.txHash,
        }),
      );

      const plainObject = savedCertificate.toObject();
      return plainToInstance(CertificateResponseDto, plainObject);
    } catch (error) {
      throw new BadRequestException(`Error updating certificate: ${error.message}`);
    }
  }

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

  async getCertificateById(id: string): Promise<CertificateResponseDto> {
    try {
      const certificate = await this.certificateModel.findById(id).exec();

      if (!certificate) {
        throw new NotFoundException('Certificate not found');
      }

      const plainObject = certificate.toObject();
      return plainToInstance(CertificateResponseDto, plainObject);
    } catch (error) {
      throw new BadRequestException(`Error getting certificate: ${error.message}`);
    }
  }

  async getCertificates(
    paginationDto: GetCertificatesRequestDto,
  ): Promise<ListRecordSuccessResponseDto<CertificateResponseDto>> {
    try {
      const { page, size, search } = paginationDto;
      const skip = (page - 1) * size;

      const searchCondition = search
        ? {
            $or: [
              { certificateType: { $regex: new RegExp(search, 'i') } },
              { txHash: { $regex: new RegExp(search, 'i') } },
            ],
          }
        : {};

      const [certificates, totalItem] = await Promise.all([
        this.certificateModel.find(searchCondition).skip(skip).limit(size).exec(),
        this.certificateModel.countDocuments(searchCondition),
      ]);

      const metadata: MetadataResponseDto = getPagination(size, page, totalItem);

      const plainObjects = certificates.map((cert) => cert.toObject());
      const certificateResponseDtos: CertificateResponseDto[] = plainToInstance(CertificateResponseDto, plainObjects);

      return {
        metadata,
        data: certificateResponseDtos,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting certificates: ${error.message}`);
    }
  }

  async deleteCertificate(user: IJwtPayload, id: string): Promise<void> {
    try {
      const certificate = await this.certificateModel.findById(id);
      if (!certificate) {
        throw new NotFoundException('Certificate not found');
      }

      const tenantDbName = this.request['tenantDbName'];
      await this.logService.createTenantLog(
        tenantDbName,
        user.username,
        user.role,
        'DELETE_CERTIFICATE',
        JSON.stringify({
          certificateId: id,
          certificateType: certificate.certificateType,
          groupId: certificate.groupId,
          txHash: certificate.txHash,
        }),
      );

      await this.certificateModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(`Error deleting certificate: ${error.message}`);
    }
  }

  async updateBlockId(txHash: string, blockId: string): Promise<void> {
    try {
      const certificate = await this.certificateModel.findOne({ txHash });
      if (!certificate) {
        throw new NotFoundException(`Certificate with txHash ${txHash} not found`);
      }

      certificate.blockId = blockId;
      await certificate.save();
    } catch (error) {
      throw new BadRequestException(`Error updating blockId: ${error.message}`);
    }
  }

  async getCertificateStatistics(): Promise<CertificateStatisticsResponseDto> {
    try {
      const [totalCertificates, confirmedCertificates, pendingCertificates] = await Promise.all([
        this.certificateModel.countDocuments(),
        this.certificateModel.countDocuments({ blockId: { $ne: 'pending' } }),
        this.certificateModel.countDocuments({ blockId: 'pending' }),
        this.certificateModel.find().sort({ createdAt: -1 }).limit(5),
      ]);

      const certificatesByType = await this.certificateModel.aggregate([
        {
          $group: {
            _id: '$certificateType',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]);

      return {
        totalCertificates,
        confirmedCertificates,
        pendingCertificates,
        certificatesByType,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting certificate statistics: ${error.message}`);
    }
  }
}

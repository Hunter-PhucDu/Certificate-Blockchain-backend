import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateRequestDto } from './dtos/request.dto';
import { KeyManagementService } from 'modules/blockchain/key-management.service';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CreateCertificateResponseDto } from './dtos/response.dto';
import { ApiSuccessResponse } from 'modules/shared/decorators/api-success-response.decorator';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Controller('certificates')
@ApiTags('Certificates')
export class CertificateController {
  constructor(
    private readonly certificatesService: CertificateService,
    private readonly keyManagementService: KeyManagementService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiSuccessResponse({ dataType: CreateCertificateResponseDto })
  async createCertificate(@Body() createCertificateDto: CertificateRequestDto): Promise<string> {
    return await this.certificatesService.processCertificate(createCertificateDto);
  }

  @Get('validate-wallet')
  async validateWallet() {
    const mnemonic = this.configService.get<string>('MNEMONIC');
    const walletAddress = this.configService.get<string>('WALLET_ADDRESS');

    if (!mnemonic || !walletAddress) {
      return {
        message: 'Lỗi: MNEMONIC hoặc WALLET_ADDRESS chưa được cấu hình.',
        success: false,
      };
    }

    const isValid = await this.keyManagementService.validatePrivateKeyWithMnemonic(mnemonic, walletAddress);

    if (isValid) {
      return {
        message: 'Private Key chính xác với WALLET_ADDRESS.',
        success: true,
      };
    } else {
      return {
        message: 'Private Key không khớp với WALLET_ADDRESS.',
        success: false,
      };
    }
  }

  @Get(':txHash')
  async getCertificate(@Param('txHash') txHash: string) {
    return await this.certificatesService.getCertificateByTxHash(txHash);
  }
}

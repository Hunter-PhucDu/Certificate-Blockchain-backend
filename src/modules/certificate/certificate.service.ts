import { Injectable, Logger } from '@nestjs/common';

import { BlockchainService } from '../blockchain/blockchain.service';
import { CertificateRequestDto } from './dtos/request.dto';
import { BlockfrostService } from 'modules/blockchain/blockfrost.service';
import { CreateCertificateResponseDto } from './dtos/response.dto';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly blockfrostService: BlockfrostService,
  ) {}

  async processCertificate(certificateData: CertificateRequestDto): Promise<CreateCertificateResponseDto> {
    const privateKey = await this.blockchainService.getPrivateKeyFromMnemonic();
    const { txId } = await this.blockchainService.buildAndSignTransaction(certificateData, privateKey);
    return { txId };
  }

  async getCertificateByTxHash(txHash: string): Promise<any> {
    const metadata = await this.blockfrostService.getTransactionMetadata(txHash);

    if (!metadata || metadata.length === 0) {
      throw new Error(`No metadata found for transaction: ${txHash}`);
    }

    this.logger.log(`Certificate metadata: ${JSON.stringify(metadata)}`);
    return metadata;
  }
}

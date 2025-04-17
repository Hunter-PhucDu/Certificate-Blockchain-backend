import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
//import { SmartContractModule } from 'modules/smart-contract/smart-contract.module';

@Module({
  imports: [SharedModule, BlockchainModule],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}

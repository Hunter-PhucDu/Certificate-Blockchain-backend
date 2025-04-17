import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { KeyManagementService } from './key-management.service';
import { BlockfrostService } from './blockfrost.service';

@Module({
  providers: [BlockchainService, KeyManagementService, BlockfrostService],
  exports: [BlockchainService, KeyManagementService, BlockfrostService],
})
export class BlockchainModule {}

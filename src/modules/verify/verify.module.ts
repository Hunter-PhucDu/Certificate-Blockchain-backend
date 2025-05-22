import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { TenantModule } from 'modules/tenant/tenant.module';
import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';

@Module({
  imports: [SharedModule, BlockchainModule, TenantModule],
  controllers: [VerifyController],
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule {}

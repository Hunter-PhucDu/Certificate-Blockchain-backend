import { Module, Scope } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { BlockConfirmationJob } from './job/block-confirmation.job';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [SharedModule, BlockchainModule, AuthModule, TenantModule, LogModule],
  controllers: [CertificateController],
  providers: [
    {
      provide: CertificateService,
      useClass: CertificateService,
      scope: Scope.REQUEST,
    },
    {
      provide: BlockConfirmationJob,
      useClass: BlockConfirmationJob,
      scope: Scope.DEFAULT,
    },
  ],
  exports: [CertificateService],
})
export class CertificateModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'modules/shared/shared.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [SharedModule, AuthModule, LogModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

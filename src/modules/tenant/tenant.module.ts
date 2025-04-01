import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'modules/shared/shared.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

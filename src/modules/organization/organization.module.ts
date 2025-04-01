import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [SharedModule, EmailModule, AuthModule, TenantModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

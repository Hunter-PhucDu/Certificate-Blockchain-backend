import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SharedModule, EmailModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

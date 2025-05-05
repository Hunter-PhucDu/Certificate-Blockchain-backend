import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'modules/shared/shared.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [SharedModule, AuthModule, LogModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

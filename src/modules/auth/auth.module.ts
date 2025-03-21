import { Module } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'modules/email/email.module';

@Module({
  imports: [SharedModule, EmailModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

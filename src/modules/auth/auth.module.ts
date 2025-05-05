import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'modules/email/email.module';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [SharedModule, forwardRef(() => EmailModule), forwardRef(() => LogModule)],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

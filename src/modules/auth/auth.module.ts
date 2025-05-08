import { Module, Scope, forwardRef } from '@nestjs/common';
import { SharedModule } from 'modules/shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'modules/email/email.module';
import { LogModule } from 'modules/log/log.module';
import { TenantModule } from 'modules/tenant/tenant.module';

@Module({
  imports: [SharedModule, forwardRef(() => EmailModule), forwardRef(() => LogModule), forwardRef(() => TenantModule)],
  providers: [
    {
      provide: AuthService,
      useClass: AuthService,
      scope: Scope.REQUEST,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

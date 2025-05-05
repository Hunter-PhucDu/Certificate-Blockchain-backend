import { forwardRef, Module, Scope } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from 'modules/shared/shared.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [SharedModule, forwardRef(() => AuthModule), forwardRef(() => LogModule)],
  controllers: [TenantController],
  providers: [
    {
      provide: TenantService,
      useClass: TenantService,
      scope: Scope.REQUEST,
    },
  ],
  exports: [TenantService],
})
export class TenantModule {}

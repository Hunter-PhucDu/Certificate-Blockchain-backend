import { Module, Scope } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [SharedModule, AuthModule, TenantModule],
  controllers: [GroupController],
  providers: [
    {
      provide: GroupService,
      useClass: GroupService,
      scope: Scope.REQUEST,
    },
  ],
  exports: [GroupService],
})
export class GroupModule {}

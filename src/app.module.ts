import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EmailModule } from 'modules/email/email.module';
import { SharedModule } from 'modules/shared/shared.module';
import { CertificateModule } from 'modules/certificate/certificate.module';
import { join } from 'path';
import { AuthModule } from 'modules/auth/auth.module';
import { AdminModule } from 'modules/admin/admin.module';
import { TenantModule } from 'modules/tenant/tenant.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { GroupModule } from 'modules/group/group.module';
import { TenantMiddleware } from 'modules/shared/middlewares/tenant.middleware';
import { OrganizationModule } from 'modules/organization/organization.module';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    AdminModule,
    OrganizationModule,
    EmailModule,
    CertificateModule,
    BlockchainModule,
    TenantModule,
    GroupModule,
    LogModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'groups*', method: RequestMethod.ALL }, { path: 'certificates*', method: RequestMethod.ALL });
  }
}

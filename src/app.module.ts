import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
// import { CertificateModule } from './modules/certificate/certificate.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantMiddleware } from './modules/shared/middlewares/tenant.middleware';
import { GroupModule } from './modules/group/group.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    AdminModule,
    EmailModule,
    // CertificateModule,
    BlockchainModule,
    TenantModule,
    GroupModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes({ path: 'groups*', method: RequestMethod.ALL });
  }
}

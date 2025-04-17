import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import appConfig from 'config/app.config';
import { EmailModule } from 'modules/email/email.module';
import { SharedModule } from 'modules/shared/shared.module';
import { CertificateModule } from 'modules/certificate/certificate.module';
import { join } from 'path';
import { AuthModule } from 'modules/auth/auth.module';
import { AdminModule } from 'modules/admin/admin.module';
import { TenantModule } from 'modules/tenant/tenant.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, appConfig],
    }),
    SharedModule,
    AuthModule,
    AdminModule,
    EmailModule,
    // OrganizationModule,
    CertificateModule,
    BlockchainModule,
    TenantModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule {}

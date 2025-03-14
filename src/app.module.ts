import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminModule } from 'modules/admin/admin.module';
import { AuthModule } from 'modules/auth/auth.module';
import { EmailModule } from 'modules/email/email.module';
import { SharedModule } from 'modules/shared/shared.module';
import { UserModule } from 'modules/user/user.module';
import { OrganizationModule } from 'modules/organization/organization.module';
import { CertificateModule } from 'modules/certificate/certificate.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { join } from 'path';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    AdminModule,
    UserModule,
    EmailModule,
    OrganizationModule,
    CertificateModule,
    BlockchainModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule {}

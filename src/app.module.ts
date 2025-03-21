import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { ConfigModule } from '@nestjs/config';
// import configFiles from './config';
import { EmailModule } from 'modules/email/email.module';
import { SharedModule } from 'modules/shared/shared.module';
import { CertificateModule } from 'modules/certificate/certificate.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
// import { SubdomainMiddleware } from 'modules/shared/middlewares/subdomain.middleware';
import { join } from 'path';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   load: configFiles,
    // }),
    SharedModule,
    AuthModule,
    // AdminModule,
    EmailModule,
    // OrganizationModule,
    CertificateModule,
    BlockchainModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(SubdomainMiddleware).forRoutes('*');
  // }
}

import { MailerModule } from '@nestjs-modules/mailer';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import configs from '../../config';
import models from './models';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { Certificate, CertificateSchema } from './schemas/certificate.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    PassportModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('db.uri'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('app.auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get('app.auth.jwtTokenExpiry'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Certificate.name, schema: CertificateSchema },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: false,
          auth: {
            user: configService.get('mail.mailAddress'),
            pass: configService.get('mail.password'),
          },
          tlsOptions: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
  ],
  providers: [Logger, JwtStrategy, ...models],
  exports: [Logger, JwtStrategy, JwtModule, ConfigModule, ...models],
})
export class SharedModule {}

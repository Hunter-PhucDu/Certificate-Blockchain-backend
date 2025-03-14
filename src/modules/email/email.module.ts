import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { SharedModule } from 'modules/shared/shared.module';

@Module({
  imports: [SharedModule, MailerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

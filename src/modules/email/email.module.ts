import { Module, forwardRef } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { SharedModule } from 'modules/shared/shared.module';
import { LogModule } from 'modules/log/log.module';

@Module({
  imports: [SharedModule, MailerModule, forwardRef(() => LogModule)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

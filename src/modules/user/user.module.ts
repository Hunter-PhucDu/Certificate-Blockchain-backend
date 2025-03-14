import { Module } from '@nestjs/common';
import { AuthModule } from 'modules/auth/auth.module';
import { SharedModule } from 'modules/shared/shared.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailModule } from 'modules/email/email.module';

@Module({
  imports: [SharedModule, AuthModule, EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

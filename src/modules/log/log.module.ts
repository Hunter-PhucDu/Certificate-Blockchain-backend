import { Module, forwardRef } from '@nestjs/common';
import { LogService } from './log.service';
import { SharedModule } from 'modules/shared/shared.module';
import { AuthModule } from 'modules/auth/auth.module';
import { LogController } from './log.controller';
import { EmailModule } from 'modules/email/email.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from 'modules/shared/schemas/log.schema';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => AuthModule),
    forwardRef(() => EmailModule),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}

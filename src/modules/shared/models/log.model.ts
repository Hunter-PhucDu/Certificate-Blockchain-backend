import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Log, LogDocument } from '../schemas/log.schema';

@Injectable()
export class LogModel {
  constructor(@InjectModel(Log.name) public model: PaginateModel<LogDocument>) {}

  async save(log: Log) {
    const createdLog = new this.model(log);
    return createdLog.save();
  }
}

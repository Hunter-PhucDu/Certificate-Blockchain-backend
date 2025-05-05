import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ERole } from '../enums/auth.enum';

export type LogDocument = Log & Document;

@Schema({
  collection: 'Logs',
})
export class Log extends Document {
  @Prop({ type: String })
  username: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;

  @Prop({ type: String })
  action: string;

  @Prop({ type: Date, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: String })
  payload: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
LogSchema.plugin(mongoosePaginate);

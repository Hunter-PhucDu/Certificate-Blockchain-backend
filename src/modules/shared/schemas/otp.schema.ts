import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export type OtpType = 'FORGOT_PASSWORD' | 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION';

export type OtpDocument = Otp & Document;

@Schema({
  collection: 'Otps',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  minimize: false,
})
export class Otp extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, type: String })
  type: OtpType;

  @Prop({ default: false })
  isUsed: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.plugin(mongoosePaginate);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

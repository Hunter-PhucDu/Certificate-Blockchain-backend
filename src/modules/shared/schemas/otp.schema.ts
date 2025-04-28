import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { OtpType } from '../enums/otp.enum';
import { ERole } from '../enums/auth.enum';

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

  @Prop({ required: true, enum: ERole })
  accountType: ERole;

  @Prop({ type: String })
  otp?: string;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ required: true, type: String, enum: OtpType })
  type: OtpType;

  @Prop({ default: false, type: Boolean })
  isUsed: boolean;

  @Prop({ type: String })
  verificationToken?: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.plugin(mongoosePaginate);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ accountId: 1, type: 1 });
OtpSchema.index({ verificationToken: 1 }, { sparse: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'Users',
  timestamps: true,
})
export class User {
  @Prop({ type: String, required: true, unique: true })
  userName: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, enum: ['SuperAdmin', 'Admin', 'Organization'], required: true })
  role: 'SuperAdmin' | 'Admin' | 'Organization';

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

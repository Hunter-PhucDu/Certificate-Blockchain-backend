import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ERole } from '../enums/auth.enum';

export type AdminDocument = Admin & Document;

@Schema({
  collection: 'Admins',
  timestamps: true,
})
export class Admin {
  @Prop({ type: String, required: false, unique: true })
  username?: string;

  @Prop({ type: String, required: false, unique: true })
  email?: string;

  @Prop({ type: Number, required: true, default: 0 })
  loginAttempts: number;

  @Prop({ type: Boolean, required: true, default: false })
  isLocked: boolean;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

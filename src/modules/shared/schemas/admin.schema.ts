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
  userName?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, unique: true })
  phone?: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

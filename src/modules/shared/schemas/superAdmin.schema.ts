import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ERole } from '../enums/auth.enum';

export type SuperAdminDocument = SuperAdmin & Document;

@Schema({
  collection: 'SuperAdmins',
  timestamps: true,
})
export class SuperAdmin {
  @Prop({ type: String, required: true, unique: true })
  userName: string;

  @Prop({ type: String, required: false, unique: true })
  email?: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin);

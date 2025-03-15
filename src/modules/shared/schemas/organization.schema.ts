import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ERole } from '../enums/auth.enum';

export type OrganizationDocument = Organization & Document;

@Schema({
  collection: 'Organizations',
  timestamps: true,
})
export class Organization {
  @Prop({ required: false, type: String })
  logo?: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, unique: true })
  phone?: string;

  @Prop({ type: String, required: true, unique: true })
  subdomain: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

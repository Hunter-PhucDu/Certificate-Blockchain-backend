import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ERole } from '../enums/auth.enum';

export type OrganizationDocument = Organization & Document;

@Schema({
  collection: 'Organizations',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Organization {
  @Prop({ required: true, ref: 'Tenants' })
  tenantId: Types.ObjectId;

  @Prop({ required: false, type: String })
  logo?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, unique: true })
  phone?: string;

  @Prop({ type: String, required: false })
  address?: string;

  // Two-factor authentication
  @Prop({ type: Boolean, required: true, default: false })
  twoFactorAuthEnabled: boolean;

  // Count of failed login attempts
  @Prop({ type: Number, required: true, default: 0 })
  loginAttempts: number;

  // Account lock when login attempts exceed the limit
  @Prop({ type: Boolean, required: true, default: false })
  isLocked: boolean;

  // Lock expires at
  @Prop({ type: Date, required: false, default: null })
  lockExpiresAt?: Date;

  // Password reset for first login
  @Prop({ type: Boolean, required: true, default: false })
  isPasswordChanged: boolean;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, enum: ERole })
  role: ERole;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

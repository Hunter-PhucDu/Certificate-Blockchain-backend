import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EStatus } from '../enums/status.enum';

export type TenantDocument = Tenant & Document;

@Schema({
  collection: 'Tenants',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Tenant {
  @Prop({ type: String, required: true })
  organizationName: string;

  @Prop({ type: String, required: true })
  tenantName: string;

  @Prop({ type: String, required: true, unique: true })
  subdomain: string;

  @Prop({ type: String, required: true, enum: EStatus })
  status: EStatus;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

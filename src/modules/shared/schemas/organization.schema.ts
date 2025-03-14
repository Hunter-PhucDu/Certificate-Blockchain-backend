import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  collection: 'Organizations',
  timestamps: true,
})
export class Organization {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ required: false, type: String })
  logo?: string;

  @Prop({ type: String, required: true, unique: true })
  subdomain: string;

  @Prop({ type: String, required: true })
  password: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

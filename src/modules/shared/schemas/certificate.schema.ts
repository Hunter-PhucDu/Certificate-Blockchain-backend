import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export type CertificateDocument = Certificate & Document;

@Schema({
  collection: 'Certificates',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Certificate {
  @Prop({ type: String, required: true, index: true })
  blockId: string;

  @Prop({ type: String, required: true, index: true })
  transactionHash: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  issuedDate: Date;

  @Prop({ type: [{ key: String, value: MongooseSchema.Types.Mixed }], default: [] })
  customData: { key: string; value: any }[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  customDataMap: Record<string, any>;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.plugin(mongoosePaginate);

CertificateSchema.pre<CertificateDocument>('save', function (next) {
  const doc = this as CertificateDocument;
  doc.customDataMap = {};

  doc.customData.forEach(({ key, value }) => {
    doc.customDataMap[key] = value;
  });

  next();
});

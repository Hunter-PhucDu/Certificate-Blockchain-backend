import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ECertificateType } from '../enums/certificateType';

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

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true, index: true })
  groupId: Types.ObjectId;

  @Prop({ type: String, required: true })
  certificateType: string;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        values: [
          {
            label: { type: String, required: true },
            value: { type: String, required: true },
            type: {
              type: String,
              enum: Object.values(ECertificateType),
              required: true,
              default: ECertificateType.STRING,
            },
            isUnique: { type: Boolean, required: false, default: false },
          },
        ],
      },
    ],
    default: [],
  })
  certificateData: object[];
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.plugin(mongoosePaginate);

CertificateSchema.index({ groupId: 1, certificateType: 1 });

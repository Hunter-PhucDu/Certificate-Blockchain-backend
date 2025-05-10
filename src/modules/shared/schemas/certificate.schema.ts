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
  @Prop({ type: String, required: false, index: true, default: 'pending' })
  blockId: string;

  @Prop({ type: String, required: true, index: true })
  txHash: string;

  @Prop({ type: Types.ObjectId, ref: 'Groups', required: true, index: true })
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
            isUnique: { type: Boolean, required: true, default: false },
          },
        ],
      },
    ],
    default: [],
  })
  certificateData: object[];

  @Prop({ type: Number, required: false })
  certificateIndex: number;

  @Prop({ type: String, required: false })
  childAddress: string;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

CertificateSchema.plugin(mongoosePaginate);

CertificateSchema.index({ groupId: 1, certificateType: 1 });
CertificateSchema.index({ txHash: 1, certificateIndex: 1 }, { unique: true, sparse: true });
CertificateSchema.index({ childAddress: 1 }, { sparse: true });

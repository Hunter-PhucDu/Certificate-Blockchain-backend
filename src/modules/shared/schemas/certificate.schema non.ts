// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoosePaginate from 'mongoose-paginate-v2';
// import { Schema as MongooseSchema, Types } from 'mongoose';
// import { EStatus } from '../enums/status.enum';

// export type CertificateDocument = Certificate & Document;

// @Schema({
//   collection: 'Certificates',
//   timestamps: {
//     createdAt: 'createdAt',
//     updatedAt: 'updatedAt',
//   },
// })
// export class Certificate {
//   @Prop({ type: String, required: true, index: true })
//   blockId: string;

//   @Prop({ type: String, required: true, index: true })
//   transactionHash: string;

//   @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
//   organizationId: Types.ObjectId;

//   @Prop({ type: String, required: true })
//   certificateName: string;

//   @Prop({ type: String, required: false, enum: EStatus, default: EStatus.ACTIVE, index: true })
//   status?: EStatus;

//   @Prop({ type: [{ key: String, value: MongooseSchema.Types.Mixed }], default: [] })
//   customData: { key: string; value: any }[];

//   @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
//   customDataMap: Record<string, any>;
// }

// export const CertificateSchema = SchemaFactory.createForClass(Certificate);
// CertificateSchema.plugin(mongoosePaginate);

// CertificateSchema.index({ blockId: 1 });
// CertificateSchema.index({ transactionHash: 1 });
// CertificateSchema.index({ organizationId: 1 });
// CertificateSchema.index({ status: 1 });
// CertificateSchema.index({ customDataMap: 1 });

// CertificateSchema.pre<CertificateDocument>('save', function (next) {
//   const doc = this as CertificateDocument;
//   doc.customDataMap = {};

//   doc.customData.forEach(({ key, value }) => {
//     doc.customDataMap[key] = value;
//   });

//   next();
// });

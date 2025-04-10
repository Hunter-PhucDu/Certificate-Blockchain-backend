import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({
  collection: 'Groups',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class Group {
  @Prop({ type: String, required: true })
  groupName: string;

  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  parentId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  path?: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  level?: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

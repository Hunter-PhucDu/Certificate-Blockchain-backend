// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import mongoosePaginate from 'mongoose-paginate-v2';
// import { ERole } from '../enums/auth.enum';

// export type AdminDocument = Admin & Document;

// @Schema({
//   collection: 'Admins',
//   timestamps: {
//     createdAt: 'createdAt',
//     updatedAt: 'updatedAt',
//   },
// })
// export class Admin {
//   @Prop({ required: true, type: String })
//   userName: string;

//   @Prop({ type: String, required: true, unique: true })
//   email: string;

//   @Prop({ required: true, type: String })
//   password: string;

//   @Prop({ required: true, type: String })
//   role: ERole;
// }

// export const AdminSchema = SchemaFactory.createForClass(Admin);
// AdminSchema.plugin(mongoosePaginate);

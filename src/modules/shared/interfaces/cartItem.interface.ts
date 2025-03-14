import { Document } from 'mongoose';

export interface CartItem extends Document {
  productId: string;
  productVariantId: string;
  quantity: number;
}

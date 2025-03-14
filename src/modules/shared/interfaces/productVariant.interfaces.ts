import { Document } from 'mongoose';

export interface ProductVariant extends Document {
  variantName1: string;
  variantValue1: string;
  variantName2: string;
  variantValue2: string;
  price: number;
  stock: number;
}

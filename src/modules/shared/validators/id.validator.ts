import { BadRequestException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

export class ValidateObjectId implements PipeTransform<string> {
  async transform(value: string) {
    const isValid = Types.ObjectId.isValid(value);
    if (!isValid) {
      throw new BadRequestException('Invalid ID!');
    }
    return value;
  }
}

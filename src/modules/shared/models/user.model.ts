import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { User, UserDocument } from '../schemas/organization.schema';

@Injectable()
export class UserModel {
  constructor(@InjectModel(User.name) public model: PaginateModel<UserDocument>) {}

  async save(user: User) {
    const createdUser = new this.model(user);
    return createdUser.save();
  }
}

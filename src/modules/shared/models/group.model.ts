import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Group, GroupDocument } from '../schemas/group.schema';

@Injectable()
export class GroupModel {
  constructor(@InjectModel(Group.name) public model: PaginateModel<GroupDocument>) {}

  async save(group: Group) {
    const createdGroup = new this.model(group);
    return createdGroup.save();
  }
}

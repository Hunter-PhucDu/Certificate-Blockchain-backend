import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Member, MemberDocument } from '../schemas/user.schema';

@Injectable()
export class MemberModel {
  constructor(@InjectModel(Member.name) public model: PaginateModel<MemberDocument>) {}

  async save(member: Member) {
    const createdMember = new this.model(member);
    return createdMember.save();
  }
}

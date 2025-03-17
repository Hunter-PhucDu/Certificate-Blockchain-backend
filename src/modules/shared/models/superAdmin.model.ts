import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { SuperAdmin, SuperAdminDocument } from '../schemas/superAdmin.schema';

@Injectable()
export class SuperAdminModel {
  constructor(@InjectModel(SuperAdmin.name) public model: PaginateModel<SuperAdminDocument>) {}

  async save(superAdmin: SuperAdmin) {
    const createdSuperAdmin = new this.model(superAdmin);
    return createdSuperAdmin.save();
  }
}

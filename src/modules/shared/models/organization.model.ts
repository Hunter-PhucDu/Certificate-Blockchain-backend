import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';

@Injectable()
export class OrganizationModel {
  constructor(@InjectModel(Organization.name) public model: PaginateModel<OrganizationDocument>) {}

  async create(data: Partial<Organization>) {
    const organization = new this.model(data);
    return organization.save();
  }

  async findBySubdomain(subdomain: string) {
    return this.model.findOne({ subdomain }).exec();
  }

  async findById(id: string) {
    return this.model.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  async updateById(id: string, data: Partial<Organization>) {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

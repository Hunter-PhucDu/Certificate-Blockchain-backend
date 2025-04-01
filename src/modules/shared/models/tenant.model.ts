import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Tenant, TenantDocument } from '../schemas/tenant.schema';

@Injectable()
export class TenantModel {
  constructor(@InjectModel(Tenant.name) public model: PaginateModel<TenantDocument>) {}

  async save(tenant: Tenant) {
    const createdTenant = new this.model(tenant);
    return createdTenant.save();
  }
}

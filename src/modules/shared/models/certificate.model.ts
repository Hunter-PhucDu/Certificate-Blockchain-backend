import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Certificate, CertificateDocument } from '../schemas/certificate.schema';

@Injectable()
export class CertificateModel {
  constructor(@InjectModel(Certificate.name) public model: PaginateModel<CertificateDocument>) {}

  async save(certificate: Certificate) {
    const createdCertificate = new this.model(certificate);
    return createdCertificate.save();
  }

  async create(data: Partial<Certificate>) {
    const certificate = new this.model(data);
    return certificate.save();
  }

  async findById(id: string) {
    return this.model.findById(id).exec();
  }

  async findByOrganizationId(organizationId: string) {
    return this.model.find({ organizationId }).exec();
  }
}

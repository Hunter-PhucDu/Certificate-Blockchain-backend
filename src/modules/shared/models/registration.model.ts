import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Registration, RegistrationDocument } from '../schemas/registration.schema';

@Injectable()
export class RegistrationModel {
  constructor(@InjectModel(Registration.name) public model: PaginateModel<RegistrationDocument>) {}

  async save(registration: Registration) {
    const createdRegistration = new this.model(registration);
    return createdRegistration.save();
  }
}

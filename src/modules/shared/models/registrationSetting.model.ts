import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { RegistrationSetting, RegistrationSettingDocument } from '../schemas/registrationSetting.schema';

@Injectable()
export class RegistrationSettingModel {
  constructor(@InjectModel(RegistrationSetting.name) public model: PaginateModel<RegistrationSettingDocument>) {}

  async save(registrationSetting: RegistrationSetting) {
    const createdRegistrationSetting = new this.model(registrationSetting);
    return createdRegistrationSetting.save();
  }
}

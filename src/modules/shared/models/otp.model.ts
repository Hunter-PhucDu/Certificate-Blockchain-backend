import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Otp, OtpDocument } from '../schemas/otp.schema';

@Injectable()
export class OtpModel {
  constructor(@InjectModel(Otp.name) public model: PaginateModel<OtpDocument>) {}

  async save(otp: Otp) {
    const createdOtp = new this.model(otp);
    return createdOtp.save();
  }
}

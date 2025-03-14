import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

@ValidatorConstraint({ async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) {
      return true;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(text) || isValidPhoneNumber(text, 'VN');
  }
  defaultMessage() {
    return 'Phone number is not valid (VN) or email is not valid';
  }
}

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsEmailOrPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailOrPhoneConstraint,
    });
  };
}

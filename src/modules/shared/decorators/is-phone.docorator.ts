import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidPhoneNumber } from 'libphonenumber-js';

@ValidatorConstraint({ async: false })
export class IsPhoneConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) {
      return true;
    }
    return isValidPhoneNumber(text, 'VN');
  }
}

export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsPhoneConstraint,
    });
  };
}

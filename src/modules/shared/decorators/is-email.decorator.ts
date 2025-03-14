import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsEmailConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!text) {
      return true;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(text);
  }
}

export function IsEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailConstraint,
    });
  };
}

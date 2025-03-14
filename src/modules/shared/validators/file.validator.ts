import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SingleImageFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Validation failed: No file uploaded.');
    }

    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('Validation failed: Uploaded file must be an image.');
    }

    return file;
  }
}

@Injectable()
export class MultipleImageFilesValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('Validation failed: No files uploaded.');
    }

    files.forEach((file) => {
      if (!file.mimetype.includes('image')) {
        throw new BadRequestException('Validation failed: Uploaded files must be images.');
      }
    });

    return files;
  }
}

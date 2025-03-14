import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationModel } from '../shared/models/organization.model';
import { EmailService } from '../email/email.service';
import { CreateOrganizationDto, UpdateOrganizationDto, GetOrganizationsDto } from './dtos/request.dto';
import { OrganizationResponseDto } from './dtos/response.dto';

import { AuthService } from '../auth/auth.service';
import { plainToInstance } from 'class-transformer';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { generateRandomPassword } from 'modules/shared/utils/password.util';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationModel: OrganizationModel,
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
  ) {}

  async createOrganization(
    createDto: CreateOrganizationDto,
    logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    try {
      const existingOrg = await this.organizationModel.findBySubdomain(createDto.subdomain);
      if (existingOrg) {
        throw new BadRequestException('Subdomain already exists');
      }

      const password = generateRandomPassword();
      const hashedPassword = await this.authService.hashPassword(password);

      let logoPath = '';
      if (logo) {
        logoPath = await this.handleLogoUpload(logo);
      }

      const organization = await this.organizationModel.create({
        ...createDto,
        password: hashedPassword,
        logo: logoPath,
      });

      await this.emailService.sendOrganizationCredentials(createDto.email, createDto.subdomain, password);

      return plainToInstance(OrganizationResponseDto, organization.toObject());
    } catch (error) {
      throw new BadRequestException(`Error creating organization: ${error.message}`);
    }
  }

  async getOrganizations(query: GetOrganizationsDto): Promise<{ items: OrganizationResponseDto[]; total: number }> {
    const { page = 1, search } = query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.organizationModel.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.organizationModel.model.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => plainToInstance(OrganizationResponseDto, item)),
      total,
    };
  }

  async getOrganizationById(id: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationModel.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return plainToInstance(OrganizationResponseDto, organization.toObject());
  }

  async updateOrganization(
    id: string,
    updateDto: UpdateOrganizationDto,
    logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationModel.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (updateDto.subdomain && updateDto.subdomain !== organization.subdomain) {
      const existingOrg = await this.organizationModel.findBySubdomain(updateDto.subdomain);
      if (existingOrg) {
        throw new BadRequestException('Subdomain already exists');
      }
    }

    let logoPath = organization.logo;
    if (logo) {
      // Xóa logo cũ nếu có
      if (organization.logo) {
        try {
          unlinkSync(join(process.cwd(), 'images', organization.logo));
        } catch (error) {
          console.error('Error deleting old logo:', error);
        }
      }
      logoPath = await this.handleLogoUpload(logo);
    }

    const updated = await this.organizationModel.updateById(id, {
      ...updateDto,
      logo: logoPath,
    });

    return plainToInstance(OrganizationResponseDto, updated.toObject());
  }

  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.organizationModel.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Xóa logo nếu có
    if (organization.logo) {
      try {
        unlinkSync(join(process.cwd(), 'images', organization.logo));
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }

    await this.organizationModel.model.findByIdAndDelete(id);
  }

  async findBySubdomain(subdomain: string) {
    return this.organizationModel.findBySubdomain(subdomain);
  }

  private async handleLogoUpload(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join('logos', fileName);

    // Lưu file vào thư mục images/logos
    await this.saveFile(file.buffer, join(process.cwd(), 'images', filePath));

    return filePath;
  }

  private async saveFile(buffer: Buffer, path: string): Promise<void> {
    const { writeFile } = require('fs/promises');
    const { mkdir } = require('fs/promises');

    try {
      await mkdir(join(process.cwd(), 'images', 'logos'), { recursive: true });
      await writeFile(path, buffer);
    } catch (error) {
      throw new BadRequestException('Error saving file');
    }
  }
}

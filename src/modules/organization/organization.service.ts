import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationModel } from '../shared/models/organization.model';
import { EmailService } from '../email/email.service';
import { AddOrganizationRequestDto, UpdateOrganizationRequestDto, GetOrganizationsDto } from './dtos/request.dto';
import { OrganizationResponseDto } from './dtos/response.dto';

import { AuthService } from '../auth/auth.service';
import { plainToInstance } from 'class-transformer';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { generateRandomPassword } from 'modules/shared/utils/password.util';
import { TenantModel } from 'modules/shared/models/tenant.model';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationModel: OrganizationModel,
    private readonly tenantModel: TenantModel,
    private readonly emailService: EmailService,
    private readonly authService: AuthService,
  ) {}

  async addOrganization(addOrganizationDto: AddOrganizationRequestDto): Promise<OrganizationResponseDto> {
    try {
      const existingOrg = await this.organizationModel.model.findOne({
        tenantId: addOrganizationDto.tenantId,
        email: addOrganizationDto.email,
      });
      if (existingOrg) {
        throw new BadRequestException('Organizatio already exists');
      }

      const password = generateRandomPassword();
      const hashedPassword = await this.authService.hashPassword(password);

      const tenantDoc = await this.tenantModel.model.findById(addOrganizationDto.tenantId);
      if (!tenantDoc) {
        throw new BadRequestException('Tenant not found');
      }

      const organization = await this.organizationModel.model.create({
        ...addOrganizationDto,
        password: hashedPassword,
      });

      await this.emailService.sendOrganizationCredentials(addOrganizationDto.email, tenantDoc.subdomain, password);

      return plainToInstance(OrganizationResponseDto, organization.toObject());
    } catch (error) {
      throw new BadRequestException(`Error creating organization: ${error.message}`);
    }
  }

  async getOrganizations(
    paginationDto: GetOrganizationsDto,
  ): Promise<ListRecordSuccessResponseDto<OrganizationResponseDto>> {
    try {
      const { page, size, search } = paginationDto;
      const skip = (page - 1) * size;

      const searchCondition = search
        ? {
            $or: [
              { organizationName: { $regex: new RegExp(search, 'i') } },
              { email: { $regex: new RegExp(search, 'i') } },
            ],
          }
        : {};

      const [organizations, totalItem] = await Promise.all([
        this.organizationModel.model.find(searchCondition).skip(skip).limit(size).exec(),
        this.organizationModel.model.countDocuments(searchCondition),
      ]);

      const metadata: MetadataResponseDto = getPagination(size, page, totalItem);
      const organizationResponseDtos: OrganizationResponseDto[] = plainToInstance(
        OrganizationResponseDto,
        organizations,
      );

      return {
        metadata,
        data: organizationResponseDtos,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting organizations: ${error.message}`);
    }
  }

  async getOrganizationById(organizationId: string): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.organizationModel.findById(organizationId);
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      return plainToInstance(OrganizationResponseDto, organization.toObject());
    } catch (error) {
      throw new BadRequestException(`Error getting organization: ${error.message}`);
    }
  }

  async updateOrganization(
    organizationId: string,
    updateDto: UpdateOrganizationRequestDto,
    logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationModel.findById(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    let logoPath = organization.logo;
    if (logo) {
      if (organization.logo) {
        try {
          unlinkSync(join(process.cwd(), 'images', organization.logo));
        } catch (error) {
          console.error('Error deleting old logo:', error);
        }
      }
      logoPath = await this.handleLogoUpload(logo);
    }

    const updated = await this.organizationModel.model.findOneAndUpdate(
      { _id: organizationId },
      {
        ...updateDto,
        logo: logoPath,
      },
      { new: true },
    );

    return plainToInstance(OrganizationResponseDto, updated.toObject());
  }

  async deleteOrganization(id: string): Promise<void> {
    const organization = await this.organizationModel.findById(id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.logo) {
      try {
        unlinkSync(join(process.cwd(), 'images', organization.logo));
      } catch (error) {
        console.error('Error deleting logo:', error);
      }
    }

    await this.organizationModel.model.findByIdAndDelete(id);
  }

  private async handleLogoUpload(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join('logos', fileName);

    await this.saveFile(file.buffer, join(process.cwd(), 'images', filePath));

    return filePath;
  }

  private async saveFile(buffer: Buffer, path: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { writeFile } = require('fs/promises');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { mkdir } = require('fs/promises');

    try {
      await mkdir(join(process.cwd(), 'images', 'logos'), { recursive: true });
      await writeFile(path, buffer);
    } catch (error) {
      throw new BadRequestException('Error saving file');
    }
  }
}

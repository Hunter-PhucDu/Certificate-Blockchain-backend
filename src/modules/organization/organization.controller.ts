import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateOrganizationDto, UpdateOrganizationDto, GetOrganizationsDto } from './dtos/request.dto';
import { OrganizationResponseDto } from './dtos/response.dto';
import { OrganizationService } from './organization.service';
import { ApiSuccessPaginationResponse } from '../shared/decorators/api-success-response.decorator';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { ERole } from 'modules/shared/enums/auth.enum';
import { Roles } from 'modules/shared/decorators/role.decorator';

@Controller('organizations')
@ApiTags('Organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Create new organization' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async createOrganization(
    @Body() createDto: CreateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    return this.organizationService.createOrganization(createDto, logo);
  }

  @Get()
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiSuccessPaginationResponse({ dataType: OrganizationResponseDto })
  async getOrganizations(
    @Query() query: GetOrganizationsDto,
  ): Promise<{ items: OrganizationResponseDto[]; total: number }> {
    return this.organizationService.getOrganizations(query);
  }

  @Get(':id')
  @Roles([ERole.SUPER_ADMIN, ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Get organization by id' })
  async getOrganization(@Param('id') id: string): Promise<OrganizationResponseDto> {
    return this.organizationService.getOrganizationById(id);
  }

  @Put(':id')
  @Roles([ERole.SUPER_ADMIN, ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Update organization' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    return this.organizationService.updateOrganization(id, updateDto, logo);
  }

  @Delete(':id')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete organization' })
  async deleteOrganization(@Param('id') id: string): Promise<void> {
    return this.organizationService.deleteOrganization(id);
  }
}

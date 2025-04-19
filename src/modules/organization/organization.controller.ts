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

import { GetOrganizationsDto, AddOrganizationRequestDto, UpdateOrganizationRequestDto } from './dtos/request.dto';
import { OrganizationResponseDto } from './dtos/response.dto';
import { OrganizationService } from './organization.service';
import { ApiSuccessPaginationResponse } from '../shared/decorators/api-success-response.decorator';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { ERole } from 'modules/shared/enums/auth.enum';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';

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
  async createOrganization(@Body() addOrganizationDto: AddOrganizationRequestDto): Promise<OrganizationResponseDto> {
    return this.organizationService.addOrganization(addOrganizationDto);
  }

  @Get(':organizationId')
  @Roles([ERole.SUPER_ADMIN, ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Get organization by id' })
  async getOrganization(@Param('organizationId') organizationId: string): Promise<OrganizationResponseDto> {
    return this.organizationService.getOrganizationById(organizationId);
  }

  @Get()
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiOperation({ summary: 'Get all organizations', description: 'Get all organizations by search' })
  @ApiSuccessPaginationResponse({ dataType: OrganizationResponseDto })
  async getOrganizations(
    @Query() getOrganizationsDto: GetOrganizationsDto,
  ): Promise<ListRecordSuccessResponseDto<OrganizationResponseDto>> {
    return this.organizationService.getOrganizations(getOrganizationsDto);
  }

  @Put(':organizationId')
  @Roles([ERole.SUPER_ADMIN, ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Update organization' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  async updateOrganization(
    @Param('organizationId', new ValidateObjectId()) organizationId: string,
    @Body() updateDto: UpdateOrganizationRequestDto,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    return this.organizationService.updateOrganization(organizationId, updateDto, logo);
  }

  @Delete(':organizationId')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete organization' })
  async deleteOrganization(@Param('organizationId', new ValidateObjectId()) organizationId: string): Promise<void> {
    return this.organizationService.deleteOrganization(organizationId);
  }
}

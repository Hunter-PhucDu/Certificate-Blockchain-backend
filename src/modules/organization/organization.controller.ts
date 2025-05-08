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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetOrganizationsDto, AddOrganizationRequestDto, UpdateOrganizationRequestDto } from './dtos/request.dto';
import {
  OrganizationResponseDto,
  OrganizationStatisticsResponseDto,
  OrganizationMonthlyStatisticsResponseDto,
} from './dtos/response.dto';
import { OrganizationService } from './organization.service';
import { ApiSuccessPaginationResponse } from '../shared/decorators/api-success-response.decorator';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { ERole } from 'modules/shared/enums/auth.enum';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { ApiSuccessResponse } from '../shared/decorators/api-success-response.decorator';

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
    @Body() addOrganizationDto: AddOrganizationRequestDto,
    @Req() req,
  ): Promise<OrganizationResponseDto> {
    const user: IJwtPayload = req.user;
    return this.organizationService.addOrganization(user, addOrganizationDto);
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
    @Req() req,
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<OrganizationResponseDto> {
    const user: IJwtPayload = req.user;
    return this.organizationService.updateOrganization(user, organizationId, updateDto, logo);
  }

  @Delete(':organizationId')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete organization' })
  async deleteOrganization(
    @Param('organizationId', new ValidateObjectId()) organizationId: string,
    @Req() req,
  ): Promise<void> {
    const user: IJwtPayload = req.user;
    return this.organizationService.deleteOrganization(user, organizationId);
  }

  @Get('dashboard/statistics')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiOperation({
    summary: 'Get organization statistics',
    description: 'Get statistics about organizations for dashboard',
  })
  @ApiSuccessResponse({ dataType: OrganizationStatisticsResponseDto })
  async getOrganizationStatistics(): Promise<OrganizationStatisticsResponseDto> {
    return this.organizationService.getOrganizationStatistics();
  }

  @Get('dashboard/monthly-statistics')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiOperation({
    summary: 'Get organization monthly statistics',
    description: 'Get monthly statistics about organization creation for chart',
  })
  @ApiSuccessResponse({ dataType: [OrganizationMonthlyStatisticsResponseDto] })
  async getOrganizationMonthlyStatistics(): Promise<OrganizationMonthlyStatisticsResponseDto[]> {
    return this.organizationService.getOrganizationMonthlyStatistics();
  }
}

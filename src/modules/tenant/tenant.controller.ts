import { Body, Controller, Post, Delete, UseGuards, Param, Get, Query, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiSuccessPaginationResponse,
  ApiSuccessResponse,
} from 'modules/shared/decorators/api-success-response.decorator';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { AddTenantRequestDto, GetTenantsRequestDto, UpdateTenantRequestDto } from './dtos/request.dto';
import { TenantResponseDto, TenantStatisticsResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { TenantService } from './tenant.service';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';

@Controller('tenants')
@ApiTags('Tenant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantServitce: TenantService) {}

  @Post('')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Add new tenant',
    description: 'Add new tenant',
  })
  @ApiBody({
    description: 'Add new tenant',
    type: AddTenantRequestDto,
  })
  @ApiSuccessResponse({ dataType: TenantResponseDto })
  async addTenant(@Body() addTenantDto: AddTenantRequestDto, @Req() req): Promise<TenantResponseDto> {
    const user: IJwtPayload = req.user;
    return await this.tenantServitce.addTenant(user, addTenantDto);
  }

  @Patch(':tenantId')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Update tenant',
    description: 'Update tenant',
  })
  @ApiSuccessResponse({ dataType: TenantResponseDto })
  async updateTenant(
    @Body() updateDto: UpdateTenantRequestDto,
    @Param('tenantId') tenantId: string,
    @Req() req,
  ): Promise<TenantResponseDto> {
    const user: IJwtPayload = req.user;
    return await this.tenantServitce.updateTenant(user, tenantId, updateDto);
  }

  @Get('search')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Search tenants with pagination',
    description: 'Search tenants with pagination by name or subdomain',
  })
  @ApiSuccessPaginationResponse({ dataType: TenantResponseDto })
  async findWithPagination(
    @Query() getTenantsRequestDto: GetTenantsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<TenantResponseDto>> {
    return await this.tenantServitce.getTenants(getTenantsRequestDto);
  }

  @Get('unused')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get all unused tenants',
    description: 'Get all tenants that are not used by any organization',
  })
  @ApiSuccessResponse({ dataType: TenantResponseDto, isArray: true })
  async getAllUnusedTenants(): Promise<TenantResponseDto[]> {
    return await this.tenantServitce.getUnusedTenants();
  }

  @Get(':tenantId')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get tenant details',
    description: 'Get tenant details',
  })
  @ApiSuccessResponse({ dataType: TenantResponseDto })
  async getTenant(@Param('tenantId') tenantId: string): Promise<TenantResponseDto> {
    return await this.tenantServitce.getTenant(tenantId);
  }

  @Delete(':tenantId')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Delete tenant',
    description: 'Delete tenant',
  })
  async deleteTenant(@Param('tenantId') tenantId: string, @Req() req): Promise<void> {
    const user: IJwtPayload = req.user;
    await this.tenantServitce.deleteTenant(user, tenantId);
  }

  @Get('dashboard/statistics')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiOperation({
    summary: 'Get tenant statistics',
    description: 'Get statistics about tenants for dashboard',
  })
  @ApiSuccessResponse({ dataType: TenantStatisticsResponseDto })
  async getTenantStatistics(): Promise<TenantStatisticsResponseDto> {
    return await this.tenantServitce.getTenantStatistics();
  }
}

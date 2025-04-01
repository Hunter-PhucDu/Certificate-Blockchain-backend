import { Body, Controller, Post, Delete, UseGuards, Param, Get, Query, Patch } from '@nestjs/common';
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
import { TenantResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { TenantService } from './tenant.service';

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
  async addTenant(@Body() addTenantDto: AddTenantRequestDto): Promise<TenantResponseDto> {
    return await this.tenantServitce.addTenant(addTenantDto);
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
  ): Promise<TenantResponseDto> {
    return await this.tenantServitce.updateTenant(tenantId, updateDto);
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

  @Get('search')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get pagination admins',
    description: 'Get pagination admins by search',
  })
  @ApiSuccessPaginationResponse({ dataType: TenantResponseDto })
  async findWithPagination(
    @Query() getTenantsRequestDto: GetTenantsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<GetTenantsRequestDto>> {
    return await this.tenantServitce.getTenants(getTenantsRequestDto);
  }

  @Get('')
  @Roles([ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get all unused tenants',
    description: 'Get all unused tenants',
  })
  @ApiSuccessPaginationResponse({ dataType: TenantResponseDto })
  async getAllUnusedTenants(
    @Query() getTenantsRequestDto: GetTenantsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<TenantResponseDto>> {
    return await this.tenantServitce.getUnusedTenants(getTenantsRequestDto);
  }

  @Delete(':tenantId')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Delete tenant',
    description: 'Delete tenant',
  })
  async deleteTenant(@Param('tenantId') tenantId: string): Promise<void> {
    await this.tenantServitce.deleteTenant(tenantId);
  }
}

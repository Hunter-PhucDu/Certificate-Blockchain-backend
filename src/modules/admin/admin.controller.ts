import { Body, Controller, Post, Put, Delete, UseGuards, Param, Req, Get, Query, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiSuccessPaginationResponse,
  ApiSuccessResponse,
} from 'modules/shared/decorators/api-success-response.decorator';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import {
  AddAdminRequestDto,
  ChangePasswordRequestDto,
  GetAdminsRequestDto,
  UpdateAdminRequestDto,
} from './dtos/request.dto';
import { AdminResponseDto } from './dtos/response.dto';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { AdminService } from './admin.service';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';

@Controller('admins')
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Add new admin',
    description: 'Add new admin',
  })
  @ApiBody({
    description: 'Add new admin',
    type: AddAdminRequestDto,
  })
  @ApiSuccessResponse({ dataType: AdminResponseDto })
  async addAdmin(@Body() addAdminDto: AddAdminRequestDto): Promise<AdminResponseDto> {
    return await this.adminService.addAdmin(addAdminDto);
  }

  @Patch('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Update username',
    description: 'Update username',
  })
  @ApiSuccessResponse({ dataType: AdminResponseDto })
  async updateAdmin(@Body() updateDto: UpdateAdminRequestDto, @Req() req): Promise<AdminResponseDto> {
    const user: IJwtPayload = req.user;
    return await this.adminService.updateAdmin(user, updateDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get admin details',
    description: 'Get admin details',
  })
  @ApiSuccessResponse({ dataType: AdminResponseDto })
  async getAdmin(@Req() req): Promise<AdminResponseDto> {
    const user: IJwtPayload = req.user;
    return await this.adminService.getAdmin(user);
  }

  @Get('search')
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get pagination admins',
    description: 'Get pagination admins by search',
  })
  @ApiSuccessPaginationResponse({ dataType: AdminResponseDto })
  async findWithPagination(
    @Query() getAdminsRequestDto: GetAdminsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<GetAdminsRequestDto>> {
    return await this.adminService.getAdmins(getAdminsRequestDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ADMIN, ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password admin',
  })
  async changePassword(@Body() body: ChangePasswordRequestDto, @Req() req): Promise<void> {
    const user: IJwtPayload = req.user;
    return await this.adminService.changePassword(user, body);
  }

  @Delete(':adminId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Delete admin',
    description: 'Delete admin',
  })
  async deleteUser(@Param('adminId') adminId: string): Promise<void> {
    await this.adminService.deleteAdmin(adminId);
  }
}

import { Body, Controller, Post, Put, Delete, UseGuards, Param, Req, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  ApiSuccessPaginationResponse,
  ApiSuccessResponse,
} from 'modules/shared/decorators/api-success-response.decorator';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { AddAdminRequestDto, ChangePasswordRequestDto, ForgotPasswordAdminDto } from './dtos/request.dto';
import { AdminResponseDto, ChangePasswordResponseDto } from './dtos/response.dto';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';
import { AdminService } from './admin.service';

@Controller('admins')
@ApiTags('Admins')
@Roles([ERole.ADMIN])
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('')
  @ApiOperation({
    summary: 'Add new admin',
    description: 'Add new admin',
  })
  @ApiBody({
    description: 'Add new admin form-data',
    type: AddAdminRequestDto,
  })
  @ApiSuccessResponse({ dataType: AdminResponseDto })
  async addAdmin(@Body() body: AddAdminRequestDto): Promise<AdminResponseDto> {
    return await this.adminService.addAdmin(body);
  }

  @Get('')
  @ApiOperation({
    summary: 'Get admins details',
    description: 'Get admins details',
  })
  @ApiSuccessPaginationResponse({ dataType: AdminResponseDto })
  async getAdmins(): Promise<AdminResponseDto[]> {
    return await this.adminService.getAdmins();
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password admin',
  })
  @ApiSuccessResponse({ dataType: ChangePasswordResponseDto })
  async changePassword(@Body() body: ChangePasswordRequestDto, @Req() req): Promise<ChangePasswordResponseDto> {
    const user: IJwtPayload = req.user;
    const res = await this.adminService.changePassword(user, body);
    return plainToInstance(ChangePasswordResponseDto, { newPassword: res.message });
  }

  @Put('forgot-password')
  @ApiOperation({
    summary: 'Forgot admin password',
    description: 'Change password admin by admin',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ADMIN])
  async forgotPasswordAdmin(@Body() forgotPasswordDto: ForgotPasswordAdminDto): Promise<void> {
    return this.adminService.forgotPassword(forgotPasswordDto);
  }

  @Delete(':adminId')
  @ApiOperation({
    summary: 'Delete admin',
    description: 'Delete admin',
  })
  async deleteUser(@Param('adminId') adminId: string): Promise<void> {
    await this.adminService.deleteAdmin(adminId);
  }
}

import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { LogService } from './log.service';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { ApiSuccessPaginationResponse } from 'modules/shared/decorators/api-success-response.decorator';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';
import { GetLogsRequestDto } from './dtos/request.dto';
import { LogResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';

@Controller('logs')
@ApiTags('Logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('system')
  @Roles([ERole.SUPER_ADMIN, ERole.ADMIN])
  @ApiOperation({ summary: 'Get system logs' })
  @ApiSuccessPaginationResponse({ dataType: LogResponseDto })
  async getSystemLogs(@Query() getLogsDto: GetLogsRequestDto): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    return this.logService.getSystemLogs(getLogsDto);
  }

  @Get('tenant/:tenantId')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get tenant logs by admin' })
  @ApiSuccessPaginationResponse({ dataType: LogResponseDto })
  async getTenantLogsByAdmin(
    @Param('tenantId', new ValidateObjectId()) tenantId: string,
    @Query() getLogsDto: GetLogsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    return this.logService.getTenantLogsByAdmin(tenantId, getLogsDto);
  }

  @Get('tenant')
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Get tenant logs by organization' })
  @ApiSuccessPaginationResponse({ dataType: LogResponseDto })
  async getTenantLogsByOrganization(
    @Req() req,
    @Query() getLogsDto: GetLogsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    const tenantDbName = req['tenantDbName'];
    return this.logService.getTenantLogs(tenantDbName, getLogsDto);
  }

  @Get('all')
  @Roles([ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all logs' })
  @ApiOkResponse({ type: [LogResponseDto] })
  async getAllLogs(): Promise<LogResponseDto[]> {
    return this.logService.getAllLogs();
  }
}

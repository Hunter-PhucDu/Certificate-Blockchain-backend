import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import { CreateCertificateRequestDto, GetCertificatesRequestDto, UpdateCertificateDto } from './dtos/request.dto';
import { CertificateResponseDto, CertificateStatisticsResponseDto } from './dtos/response.dto';
import {
  ApiSuccessResponse,
  ApiSuccessPaginationResponse,
} from 'modules/shared/decorators/api-success-response.decorator';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';

@Controller('certificates')
@ApiTags('Certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Create new certificate' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async createCertificate(
    @Body() createCertificateDto: CreateCertificateRequestDto,
    @Req() req,
  ): Promise<CertificateResponseDto> {
    const user: IJwtPayload = req.user;
    return this.certificateService.createCertificate(user, createCertificateDto);
  }

  @Put(':certificateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Update certificate' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async updateCertificate(
    @Param('certificateId', new ValidateObjectId()) certificateId: string,
    @Body() updateDto: UpdateCertificateDto,
    @Req() req,
  ): Promise<CertificateResponseDto> {
    const user: IJwtPayload = req.user;
    return this.certificateService.updateCertificate(user, certificateId, updateDto);
  }

  @Get('tx/:txHash')
  @ApiOperation({ summary: 'Get certificate metadata by transaction hash' })
  async getCertificateByTxHash(@Param('txHash') txHash: string) {
    return await this.certificateService.getCertificateByTxHash(txHash);
  }

  @Get(':certificateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION, ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async getCertificate(
    @Param('certificateId', new ValidateObjectId()) certificateId: string,
  ): Promise<CertificateResponseDto> {
    return this.certificateService.getCertificateById(certificateId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION, ERole.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all certificates', description: 'Get all certificates by search' })
  @ApiSuccessPaginationResponse({ dataType: CertificateResponseDto })
  async getCertificates(
    @Query() getCertificatesDto: GetCertificatesRequestDto,
  ): Promise<ListRecordSuccessResponseDto<CertificateResponseDto>> {
    return this.certificateService.getCertificates(getCertificatesDto);
  }

  @Delete(':certificateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Delete certificate' })
  async deleteCertificate(
    @Param('certificateId', new ValidateObjectId()) certificateId: string,
    @Req() req,
  ): Promise<void> {
    const user: IJwtPayload = req.user;
    return this.certificateService.deleteCertificate(user, certificateId);
  }

  @Get('dashboard/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({
    summary: 'Get certificate statistics',
    description: 'Get statistics about certificates for dashboard',
  })
  @ApiSuccessResponse({ dataType: CertificateStatisticsResponseDto })
  async getCertificateStatistics(): Promise<CertificateStatisticsResponseDto> {
    return await this.certificateService.getCertificateStatistics();
  }
}

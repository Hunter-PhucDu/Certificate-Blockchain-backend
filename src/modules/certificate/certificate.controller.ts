import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CertificateRequestDto,
  GetCertificatesRequestDto,
  UpdateCertificateDto,
  ValidateCertificateDto,
} from './dtos/request.dto';

import { Organization } from '../shared/decorators/organization.decorator';
import { ApiSuccessPaginationResponse, ApiSuccessResponse } from '../shared/decorators/api-success-response.decorator';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ERole } from 'modules/shared/enums/auth.enum';
import { CertificateService } from './certificate.service';
import { CertificateResponseDto } from './dtos/response.dto';

@Controller('certificates')
@ApiTags('Certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Create new certificate' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async createCertificate(
    @Body() createDto: CertificateRequestDto,
    @Organization() organizationId: string,
  ): Promise<CertificateResponseDto> {
    return this.certificateService.createCertificate(createDto, organizationId);
  }

  @Get()
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Get certificates' })
  @ApiSuccessPaginationResponse({ dataType: CertificateResponseDto })
  async getCertificates(
    @Query() query: GetCertificatesRequestDto,
    @Organization() organizationId: string,
  ): Promise<{ items: CertificateResponseDto[]; total: number }> {
    return this.certificateService.getCertificates(query, organizationId);
  }

  @Get(':id')
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Get certificate by id' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async getCertificate(
    @Param('id') id: string,
    @Organization() organizationId: string,
  ): Promise<CertificateResponseDto> {
    return this.certificateService.getCertificateById(id, organizationId);
  }

  @Put(':id')
  @Roles([ERole.ORGANIZATION])
  @ApiOperation({ summary: 'Update certificate status' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto })
  async updateCertificate(
    @Param('id') id: string,
    @Body() updateDto: UpdateCertificateDto,
    @Organization() organizationId: string,
  ): Promise<CertificateResponseDto> {
    return this.certificateService.updateCertificate(id, organizationId, updateDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate certificate by serial number' })
  async validateCertificate(
    @Body() validateDto: ValidateCertificateDto,
  ): Promise<{ isValid: boolean; certificateData?: CertificateResponseDto }> {
    return this.certificateService.validateCertificate(validateDto);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VerifyService } from './verify.service';
import { SearchCertificateByValueRequestDto } from './dtos/request.dto';
import { CertificateResponseDto } from './dtos/response.dto';
import { ApiSuccessResponse } from 'modules/shared/decorators/api-success-response.decorator';

@Controller('verify')
@ApiTags('Verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Get('tx/:txHash')
  @ApiOperation({ summary: 'Get certificate details by transaction hash' })
  @ApiParam({ name: 'txHash', description: 'Transaction hash of the certificate' })
  async getCertificateByTxHash(@Param('txHash') txHash: string) {
    return await this.verifyService.getCertificateByTxHash(txHash);
  }

  @Get('metadata/:txHash')
  @ApiOperation({ summary: 'Get certificate metadata by transaction hash' })
  @ApiParam({ name: 'txHash', description: 'Transaction hash of the certificate' })
  @ApiQuery({ name: 'index', required: false, description: 'Index of the certificate in bulk transaction' })
  async getCertificateMetadata(@Param('txHash') txHash: string, @Query('index') index?: number) {
    return await this.verifyService.getCertificateMetadataByTxHash(txHash, index);
  }

  @Get('search-by-value')
  @ApiOperation({ summary: 'Search certificate by value' })
  @ApiQuery({ name: 'searchValue', required: true, description: 'Value to search for in certificate data' })
  @ApiSuccessResponse({ dataType: CertificateResponseDto, isArray: true })
  async searchCertificateByValue(@Query() searchValue: SearchCertificateByValueRequestDto) {
    return await this.verifyService.searchCertificateByValue(searchValue);
  }
}

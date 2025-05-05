import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockfrostService } from 'modules/blockchain/blockfrost.service';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { TenantService } from 'modules/tenant/tenant.service';
import { CertificateSchema } from 'modules/shared/schemas/certificate.schema';
import { TenantResponseDto } from 'modules/tenant/dtos/response.dto';
import { LogService } from '../../log/log.service';
import { ERole } from 'modules/shared/enums/auth.enum';

@Injectable()
export class BlockConfirmationJob {
  constructor(
    private readonly blockfrostService: BlockfrostService,
    private readonly tenantService: TenantService,
    private readonly logService: LogService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleBlockConfirmation() {
    try {
      const tenants = await this.tenantService.getAllTenants();

      for (const tenant of tenants) {
        await this.processTenantCertificates(tenant);
      }

      await this.logService.createSystemLog(
        'System',
        ERole.SUPER_ADMIN,
        'BLOCK_CONFIRMATION_JOB_COMPLETED',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          totalTenants: tenants.length,
        }),
      );
    } catch (error) {
      console.log('Error in block confirmation job', error.stack);

      await this.logService.createSystemLog(
        'System',
        ERole.SUPER_ADMIN,
        'BLOCK_CONFIRMATION_JOB_ERROR',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack,
        }),
      );
    }
  }

  private async processTenantCertificates(tenant: TenantResponseDto) {
    const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;

    const tenantDb = this.connection.useDb(tenantDbName, { useCache: true });
    const certificateModel = tenantDb.model('Certificate', CertificateSchema);

    const unconfirmedCertificates = await certificateModel.find({
      $or: [{ blockId: 'pending' }, { blockId: '' }, { blockId: null }, { blockId: { $exists: false } }],
    });

    console.log(`Found ${unconfirmedCertificates.length} unconfirmed certificates for tenant: ${tenant.tenantName}`);

    for (const certificate of unconfirmedCertificates) {
      try {
        const txInfo = await this.blockfrostService.getTransaction(certificate.txHash);

        if (txInfo && txInfo.block) {
          certificate.blockId = txInfo.block;
          await certificate.save();

          await this.logService.createTenantLog(
            tenantDbName,
            'System',
            ERole.SUPER_ADMIN,
            'CERTIFICATE_BLOCK_CONFIRMED',
            JSON.stringify({
              certificateId: certificate._id,
              txHash: certificate.txHash,
              blockId: txInfo.block,
            }),
          );
        } else {
          console.log(`Transaction ${certificate.txHash} not yet confirmed in a block`);
        }
      } catch (error) {
        console.log(`Error processing certificate ${certificate._id}: ${error.message}`);

        await this.logService.createTenantLog(
          tenantDbName,
          'System',
          ERole.SUPER_ADMIN,
          'CERTIFICATE_BLOCK_CONFIRMATION_ERROR',
          JSON.stringify({
            certificateId: certificate._id,
            txHash: certificate.txHash,
            error: error.message,
          }),
        );
      }
    }
  }
}

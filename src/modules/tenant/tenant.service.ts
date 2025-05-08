import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TenantModel } from 'modules/shared/models/tenant.model';
import { OrganizationModel } from 'modules/shared/models/organization.model';
import { AddTenantRequestDto, GetTenantsRequestDto, UpdateTenantRequestDto } from './dtos/request.dto';
import { TenantResponseDto, TenantStatisticsResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { EStatus } from 'modules/shared/enums/status.enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LogService } from 'modules/log/log.service';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantModel: TenantModel,
    private readonly organizationModel: OrganizationModel,
    @InjectConnection() private readonly db: Connection,
    private readonly logService: LogService,
  ) {}

  async addTenant(user: IJwtPayload, addTenantDto: AddTenantRequestDto): Promise<TenantResponseDto> {
    const session = await this.db.startSession();
    session.startTransaction();
    let newDb;
    let newDbCreated = false;

    try {
      const { tenantName, subdomain } = addTenantDto;
      const existedTenant = await this.tenantModel.model.findOne({ tenantName, subdomain }).session(session);

      if (existedTenant) {
        await this.logService.createSystemLog(
          user.username,
          user.role,
          'CREATE_TENANT_FAILED',
          JSON.stringify({ tenantName, subdomain, reason: 'Tenant name or subdomain has been registered' }),
        );
        throw new BadRequestException('Tenant name or subdomain has been registered.');
      }

      const newUser = await new this.tenantModel.model({
        ...addTenantDto,
        status: EStatus.ACTIVE,
      }).save({ session });

      const newDbName = `tenant_${tenantName.replace(/\s+/g, '_').toLowerCase()}`;

      const dbList = await this.db.db.admin().listDatabases();
      if (dbList.databases.some((db) => db.name === newDbName)) {
        throw new BadRequestException(`Database ${newDbName} already exists.`);
      }

      newDb = this.db.useDb(newDbName);

      await newDb.createCollection('Certificates');
      await newDb.createCollection('Groups');
      await newDb.createCollection('Logs');
      newDbCreated = true;

      await session.commitTransaction();

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'CREATE_TENANT_SUCCESS',
        JSON.stringify({
          tenantId: newUser._id,
          tenantName,
          subdomain,
          status: EStatus.ACTIVE,
        }),
      );

      return plainToInstance(TenantResponseDto, newUser.toObject());
    } catch (e) {
      await session.abortTransaction();

      if (newDbCreated && newDb) {
        try {
          await newDb.dropDatabase();
        } catch (dropError) {
          await this.logService.createSystemLog(
            user.username,
            user.role,
            'DROP_TENANT_DB_FAILED',
            JSON.stringify({ tenantName: addTenantDto.tenantName, error: dropError.message }),
          );
        }
      }

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'CREATE_TENANT_FAILED',
        JSON.stringify({ tenantName: addTenantDto.tenantName, error: e.message }),
      );

      throw new BadRequestException(`Error while adding new Tenant: ${e.message}`);
    } finally {
      session.endSession();
    }
  }

  async getTenant(tenantId: string): Promise<TenantResponseDto> {
    try {
      const tenantDoc = await this.tenantModel.model.findById(tenantId);
      if (!tenantDoc) {
        throw new BadRequestException('Tenant not found');
      }

      return plainToInstance(TenantResponseDto, tenantDoc.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while getting tenant detail: ${error.message}`);
    }
  }

  async updateTenant(
    user: IJwtPayload,
    tenantId: string,
    updateTenantDto: UpdateTenantRequestDto,
  ): Promise<TenantResponseDto> {
    try {
      const tenantDoc = await this.tenantModel.model.findById({ _id: tenantId });
      if (!tenantDoc) {
        await this.logService.createSystemLog(
          user.username,
          user.role,
          'UPDATE_TENANT_FAILED',
          JSON.stringify({ tenantId, reason: 'Tenant not found' }),
        );
        throw new BadRequestException('Tenant not found');
      }

      const updatedTenant = await this.tenantModel.model.findOneAndUpdate(
        { _id: tenantId },
        { $set: updateTenantDto },
        { new: true },
      );

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'UPDATE_TENANT_SUCCESS',
        JSON.stringify({
          tenantId,
          tenantName: updatedTenant.tenantName,
          updates: updateTenantDto,
        }),
      );

      return plainToInstance(TenantResponseDto, updatedTenant.toObject());
    } catch (error) {
      await this.logService.createSystemLog(
        user.username,
        user.role,
        'UPDATE_TENANT_FAILED',
        JSON.stringify({ tenantId, error: error.message }),
      );
      throw new BadRequestException(`Error while updating tenant: ${error.message}`);
    }
  }

  async getTenants(paginationDto: GetTenantsRequestDto): Promise<ListRecordSuccessResponseDto<TenantResponseDto>> {
    const { page, size, search } = paginationDto;
    const skip = (page - 1) * size;

    const searchCondition = search
      ? {
          $or: [
            { tenantName: { $regex: new RegExp(search, 'i') } },
            { subdomain: { $regex: new RegExp(search, 'i') } },
          ],
        }
      : {};

    const [tenants, totalItem] = await Promise.all([
      this.tenantModel.model.find(searchCondition).skip(skip).limit(size).exec(),
      this.tenantModel.model.countDocuments(searchCondition),
    ]);

    const metadata: MetadataResponseDto = getPagination(size, page, totalItem);
    const tenantResponseDtos: TenantResponseDto[] = plainToInstance(TenantResponseDto, tenants);

    return {
      metadata,
      data: tenantResponseDtos,
    };
  }

  async getAllTenants(): Promise<TenantResponseDto[]> {
    try {
      const tenants = await this.tenantModel.model.find({ status: EStatus.ACTIVE }).exec();
      return plainToInstance(TenantResponseDto, tenants);
    } catch (error) {
      throw new BadRequestException(`Error getting all tenants: ${error.message}`);
    }
  }

  async getUnusedTenants(): Promise<TenantResponseDto[]> {
    try {
      const usedTenantIds = await this.organizationModel.model.distinct('tenantId');
      const unusedTenants = await this.tenantModel.model.find({
        _id: { $nin: usedTenantIds },
      });
      return plainToInstance(TenantResponseDto, unusedTenants);
    } catch (error) {
      throw new BadRequestException(`Error getting unused tenants: ${error.message}`);
    }
  }

  async deleteTenant(user: IJwtPayload, tenantId: string): Promise<void> {
    try {
      const deletedTenant = await this.tenantModel.model.findOneAndUpdate(
        { _id: tenantId },
        { $set: { status: EStatus.SUSPENDED } },
      );

      if (!deletedTenant) {
        await this.logService.createSystemLog(
          user.username,
          user.role,
          'DELETE_TENANT_FAILED',
          JSON.stringify({ tenantId, reason: 'Tenant not found' }),
        );
        throw new BadRequestException('Tenant not found');
      }

      await this.logService.createSystemLog(
        user.username,
        user.role,
        'DELETE_TENANT_SUCCESS',
        JSON.stringify({
          tenantId,
          tenantName: deletedTenant.tenantName,
          status: EStatus.SUSPENDED,
        }),
      );
    } catch (error) {
      await this.logService.createSystemLog(
        user.username,
        user.role,
        'DELETE_TENANT_FAILED',
        JSON.stringify({ tenantId, error: error.message }),
      );
      throw new BadRequestException(`Error while deleting tenant: ${error.message}`);
    }
  }

  async findBySubdomain(subdomain: string): Promise<TenantResponseDto> {
    try {
      const tenantDoc = await this.tenantModel.model.findOne({ subdomain });

      if (!tenantDoc) {
        throw new BadRequestException('Tenant not found');
      }
      return plainToInstance(TenantResponseDto, tenantDoc.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while getting tenant:${subdomain}-> ${error.message}`);
    }
  }

  async getTenantStatistics(): Promise<TenantStatisticsResponseDto> {
    try {
      const [totalTenants, activeTenants, suspendedTenants, unusedTenants] = await Promise.all([
        this.tenantModel.model.countDocuments(),
        this.tenantModel.model.countDocuments({ status: EStatus.ACTIVE }),
        this.tenantModel.model.countDocuments({ status: EStatus.SUSPENDED }),
        this.getUnusedTenantsCount(),
      ]);

      return {
        totalTenants,
        activeTenants,
        suspendedTenants,
        unusedTenants,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting tenant statistics: ${error.message}`);
    }
  }

  private async getUnusedTenantsCount(): Promise<number> {
    const usedTenantIds = await this.organizationModel.model.distinct('tenantId');
    return this.tenantModel.model.countDocuments({
      _id: { $nin: usedTenantIds },
    });
  }
}

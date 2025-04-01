import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TenantModel } from 'modules/shared/models/tenant.model';
import { AddTenantRequestDto, GetTenantsRequestDto, UpdateTenantRequestDto } from './dtos/request.dto';
import { TenantResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { EStatus } from 'modules/shared/enums/status.enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantModel: TenantModel,
    private readonly organizationModel: TenantModel,
    @InjectConnection() private readonly db: Connection,
  ) {}

  // async addTenant(addTenantDto: AddTenantRequestDto): Promise<TenantResponseDto> {
  //   const session = await this.tenantModel.model.db.startSession();
  //   session.startTransaction();

  //   try {
  //     const { tenantName, subdomain } = addTenantDto;
  //     const existedTenant = await this.tenantModel.model.findOne({ tenantName, subdomain });

  //     if (existedTenant) {
  //       throw new BadRequestException('Tenant name or subdomain has been registered.');
  //     }

  //     const newDbName = `tenant_${tenantName.replace(/\s+/g, '_').toLowerCase()}`;
  //     const newDb = this.db.useDb(newDbName);

  //     await newDb.createCollection('Certificates');

  //     const newUser = await this.tenantModel.save({
  //       ...addTenantDto,
  //       status: EStatus.ACTIVE,
  //     });

  //     await session.commitTransaction();

  //     return plainToInstance(TenantResponseDto, newUser.toObject());
  //   } catch (e) {
  //     await session.abortTransaction();
  //     throw e;
  //   } finally {
  //     session.endSession();
  //   }
  // }

  async addTenant(addTenantDto: AddTenantRequestDto): Promise<TenantResponseDto> {
    const session = await this.db.startSession();
    session.startTransaction();
    let newDb;
    let newDbCreated = false;

    try {
      const { tenantName, subdomain } = addTenantDto;
      const existedTenant = await this.tenantModel.model.findOne({ tenantName, subdomain }).session(session);

      if (existedTenant) {
        throw new BadRequestException('Tenant name or subdomain has been registered.');
      }

      const newUser = await new this.tenantModel.model({
        ...addTenantDto,
        status: EStatus.ACTIVE,
      }).save({ session });

      // Tạo một database mới với tên tenant
      const newDbName = `tenant_${tenantName.replace(/\s+/g, '_').toLowerCase()}`;

      const dbList = await this.db.db.admin().listDatabases();
      if (dbList.databases.some((db) => db.name === newDbName)) {
        throw new BadRequestException(`Database ${newDbName} already exists.`);
      }

      newDb = this.db.useDb(newDbName);

      // Tạo collection mặc định
      await newDb.createCollection('Certificates');
      newDbCreated = true;

      await session.commitTransaction();
      return plainToInstance(TenantResponseDto, newUser.toObject());
    } catch (e) {
      await session.abortTransaction();

      // Nếu database tenant mới đã được tạo, thực hiện xoá để tránh dư dữ liệu
      if (newDbCreated && newDb) {
        try {
          await newDb.dropDatabase();
        } catch (dropError) {
          console.error('Error dropping tenant database:', dropError);
        }
      }
      throw new BadRequestException(`Error while adding new Tenant: ${e.message}`);
    } finally {
      session.endSession();
    }
  }

  async getTenant(tenantId: string): Promise<TenantResponseDto> {
    try {
      const tenantDoc = await this.tenantModel.model.findById({ _id: tenantId });
      if (!tenantDoc) {
        throw new BadRequestException('Tenant not found');
      }

      return plainToInstance(TenantResponseDto, tenantDoc.toObject());
    } catch (error) {
      throw new BadRequestException(`Error while getting tenant detail: ${error.message}`);
    }
  }

  async updateTenant(tenantId: string, updateTenantDto: UpdateTenantRequestDto): Promise<TenantResponseDto> {
    try {
      const tenantDoc = await this.tenantModel.model.findById({ _id: tenantId });
      if (!tenantDoc) {
        throw new BadRequestException('Tenant not found');
      }

      const updatedTenant = await this.tenantModel.model.findOneAndUpdate(
        { _id: tenantId },
        { $set: updateTenantDto },
        { new: true },
      );
      return plainToInstance(TenantResponseDto, updatedTenant.toObject());
    } catch (error) {
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

  async getUnusedTenants(
    paginationDto: GetTenantsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<TenantResponseDto>> {
    const { page, size, search } = paginationDto;
    const skip = (page - 1) * size;

    const usedTenantIds = await this.organizationModel.model.distinct('tenantId');

    const searchCondition: any = {
      _id: { $nin: usedTenantIds },
    };

    if (search) {
      searchCondition.$or = [
        { tenantName: { $regex: new RegExp(search, 'i') } },
        { subdomain: { $regex: new RegExp(search, 'i') } },
      ];
    }

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

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const deletedTenant = await this.tenantModel.model.findOneAndUpdate(
        { _id: tenantId },
        { $set: { status: EStatus.SUSPENDED } },
      );

      if (!deletedTenant) {
        throw new BadRequestException('Tenant not found');
      }
    } catch (error) {
      throw new BadRequestException(`Error while deleting tenant: ${error.message}`);
    }
  }
}

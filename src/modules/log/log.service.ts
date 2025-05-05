import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Log, LogDocument, LogSchema } from 'modules/shared/schemas/log.schema';
import { ERole } from 'modules/shared/enums/auth.enum';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TenantModel } from 'modules/shared/models/tenant.model';
import { plainToInstance } from 'class-transformer';
import { LogResponseDto } from './dtos/response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { GetLogsRequestDto } from './dtos/request.dto';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';

@Injectable()
export class LogService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(
    @InjectModel(Log.name) private readonly logModel: Model<LogDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly tenantModel: TenantModel,
  ) {
    const secretKey = this.configService.get<string>('LOG_SECRET_KEY');
    this.key = crypto.scryptSync(secretKey, 'salt', 32);
    this.iv = crypto.randomBytes(16);
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting payload:', error);
      return encryptedText; // Trả về payload gốc nếu không giải mã được
    }
  }

  async createSystemLog(username: string, role: ERole, action: string, payload: string) {
    const encryptedPayload = this.encrypt(payload);
    const log = new this.logModel({
      username,
      role,
      action,
      payload: encryptedPayload,
      timestamp: new Date(),
    });
    await log.save();
  }

  async createTenantLog(tenantDbName: string, username: string, role: ERole, action: string, payload: string) {
    const encryptedPayload = this.encrypt(payload);
    const tenantDb = this.connection.useDb(tenantDbName);
    const TenantLogModel = tenantDb.model<LogDocument>('Log', LogSchema, 'Logs');
    const log = new TenantLogModel({
      username,
      role,
      action,
      payload: encryptedPayload,
      timestamp: new Date(),
    });
    await log.save();
  }

  async getSystemLogs(getLogsDto: GetLogsRequestDto): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    const { page, size, search } = getLogsDto;
    const skip = (page - 1) * size;
    const query = search ? { action: { $regex: search, $options: 'i' } } : {};

    const [logs, total] = await Promise.all([
      this.logModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(size),
      this.logModel.countDocuments(query),
    ]);

    const metadata: MetadataResponseDto = getPagination(size, page, total);
    const logResponseDtos: LogResponseDto[] = logs.map((log) => {
      const logObj = log.toObject();
      return plainToInstance(LogResponseDto, {
        ...logObj,
        payload: this.decrypt(logObj.payload),
      });
    });

    return {
      metadata,
      data: logResponseDtos,
    };
  }

  async getTenantLogsByAdmin(
    tenantId: string,
    getLogsDto: GetLogsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    const tenant = await this.tenantModel.model.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
    return this.getTenantLogs(tenantDbName, getLogsDto);
  }

  async getTenantLogs(
    tenantDbName: string,
    getLogsDto: GetLogsRequestDto,
  ): Promise<ListRecordSuccessResponseDto<LogResponseDto>> {
    const { page, size, search } = getLogsDto;
    const skip = (page - 1) * size;
    const query = search ? { action: { $regex: search, $options: 'i' } } : {};

    const tenantDb = this.connection.useDb(tenantDbName);
    const TenantLogModel = tenantDb.model<LogDocument>('Log', LogSchema, 'Logs');

    const [logs, total] = await Promise.all([
      TenantLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(size),
      TenantLogModel.countDocuments(query),
    ]);

    const metadata: MetadataResponseDto = getPagination(size, page, total);
    const logResponseDtos: LogResponseDto[] = logs.map((log) => {
      const logObj = log.toObject();
      return plainToInstance(LogResponseDto, {
        ...logObj,
        payload: this.decrypt(logObj.payload),
      });
    });

    return {
      metadata,
      data: logResponseDtos,
    };
  }
}

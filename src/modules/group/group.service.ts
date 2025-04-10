import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Group } from '../shared/schemas/group.schema';
import { AddGroupRequestDto, UpdateGroupRequestDto, GetGroupsDto } from './dtos/request.dto';
import { GroupResponseDto } from './dtos/response.dto';
import { GroupSchema } from '../shared/schemas/group.schema';
import { plainToInstance } from 'class-transformer';
import { getPagination } from 'modules/shared/utils/get-pagination';
import { MetadataResponseDto } from 'modules/shared/dtos/metadata-response.dto';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';

@Injectable()
export class GroupService {
  private get groupModel(): Model<Group> {
    console.log('====== GROUP SERVICE REQUEST INFO ======');
    console.log('Request object:', {
      headers: this.request.headers,
      hostname: this.request.hostname,
      originalUrl: this.request.originalUrl,
    });
    console.log('Tenant information:', this.request['tenant']);
    console.log('TenantDb available:', !!this.request['tenantDb']);
    console.log('====================================');

    const tenantDb = this.request['tenantDb'];
    if (!tenantDb) {
      throw new BadRequestException('Tenant database not found');
    }
    return tenantDb.model<Group>('Group', GroupSchema);
  }

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async addGroup(addGroupDto: AddGroupRequestDto): Promise<GroupResponseDto> {
    try {
      let path: Types.ObjectId[] = [];
      let level = 0;

      const existingGroup = await this.groupModel.findOne({ groupName: addGroupDto.groupName });
      if (existingGroup) {
        throw new BadRequestException('Group with this name already exists');
      }

      if (addGroupDto.parentId) {
        const parent = await this.groupModel.findById(addGroupDto.parentId);
        if (!parent) {
          throw new NotFoundException('Parent group not found');
        }
        path = [...parent.path, parent._id];
        level = parent.level + 1;
      }

      const created = new this.groupModel({
        ...addGroupDto,
        path,
        level,
      });

      const saved = await created.save();
      return plainToInstance(GroupResponseDto, saved);
    } catch (error) {
      throw new BadRequestException(`Error creating Group: ${error.message}`);
    }
  }

  async getGroups(paginationDto: GetGroupsDto): Promise<ListRecordSuccessResponseDto<GroupResponseDto>> {
    try {
      const { page, size, search } = paginationDto;
      const skip = (page - 1) * size;

      const searchCondition = search
        ? {
            $or: [{ groupName: { $regex: new RegExp(search, 'i') } }],
          }
        : {};

      const [groups, totalItem] = await Promise.all([
        this.groupModel.find(searchCondition).skip(skip).limit(size).exec(),
        this.groupModel.countDocuments(searchCondition),
      ]);

      const metadata: MetadataResponseDto = getPagination(size, page, totalItem);
      const groupResponseDtos: GroupResponseDto[] = plainToInstance(GroupResponseDto, groups);

      return {
        metadata,
        data: groupResponseDtos,
      };
    } catch (error) {
      throw new BadRequestException(`Error getting Groups: ${error.message}`);
    }
  }

  async getGroupById(groupId: string): Promise<GroupResponseDto> {
    try {
      const group = await this.groupModel.findById(groupId).exec();
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      return plainToInstance(GroupResponseDto, group);
    } catch (error) {
      throw new BadRequestException(`Error getting Group: ${error.message}`);
    }
  }

  async updateGroup(groupId: string, updateDto: UpdateGroupRequestDto): Promise<GroupResponseDto> {
    try {
      const group = await this.groupModel.findById(groupId);
      if (!group) {
        throw new NotFoundException('Group not found');
      }

      if (updateDto.parentId && updateDto.parentId !== group.parentId?.toString()) {
        const newParent = await this.groupModel.findById(updateDto.parentId);
        if (!newParent) {
          throw new NotFoundException('New parent group not found');
        }

        group.parentId = new Types.ObjectId(updateDto.parentId);
        group.path = [...newParent.path, newParent._id];
        group.level = newParent.level + 1;
      }

      if (updateDto.groupName) group.groupName = updateDto.groupName;

      const updated = await group.save();
      return plainToInstance(GroupResponseDto, updated);
    } catch (error) {
      throw new BadRequestException(`Error updating Group: ${error.message}`);
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      const group = await this.groupModel.findById(id);
      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const hasChildren = await this.groupModel.exists({ parentId: id });
      if (hasChildren) {
        throw new BadRequestException('Cannot delete a group with children');
      }

      await this.groupModel.findByIdAndDelete(id);
    } catch (error) {
      throw new BadRequestException(`Error deleting Group: ${error.message}`);
    }
  }
}

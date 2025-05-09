import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UpdateGroupRequestDto, AddGroupRequestDto, GetGroupsDto } from './dtos/request.dto';
import { GroupResponseDto } from './dtos/response.dto';
import { GroupService } from './group.service';
import { ApiSuccessPaginationResponse } from '../shared/decorators/api-success-response.decorator';
import { JwtAuthGuard } from 'modules/shared/gaurds/jwt.guard';
import { RolesGuard } from 'modules/shared/gaurds/role.gaurd';
import { ERole } from 'modules/shared/enums/auth.enum';
import { Roles } from 'modules/shared/decorators/role.decorator';
import { ListRecordSuccessResponseDto } from 'modules/shared/dtos/list-record-success-response.dto';
import { ValidateObjectId } from 'modules/shared/validators/id.validator';
import { IJwtPayload } from 'modules/shared/interfaces/auth.interface';

@Controller('groups')
@ApiTags('Groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles([ERole.ORGANIZATION])
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create new group' })
  async createGroup(@Body() addGroupDto: AddGroupRequestDto, @Req() req): Promise<GroupResponseDto> {
    const user: IJwtPayload = req.user;
    return this.groupService.addGroup(user, addGroupDto);
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Get group by id' })
  async getGroup(@Param('groupId', new ValidateObjectId()) groupId: string): Promise<GroupResponseDto> {
    return this.groupService.getGroupById(groupId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups', description: 'Get all groups by search' })
  @ApiSuccessPaginationResponse({ dataType: GroupResponseDto })
  async getGroups(@Query() getGroupsDto: GetGroupsDto): Promise<ListRecordSuccessResponseDto<GroupResponseDto>> {
    return this.groupService.getGroups(getGroupsDto);
  }

  @Put(':groupId')
  @ApiOperation({ summary: 'Update group' })
  async updateGroup(
    @Param('groupId', new ValidateObjectId()) groupId: string,
    @Body() updateDto: UpdateGroupRequestDto,
    @Req() req,
  ): Promise<GroupResponseDto> {
    const user: IJwtPayload = req.user;
    return this.groupService.updateGroup(user, groupId, updateDto);
  }

  @Delete(':groupId')
  @ApiOperation({ summary: 'Delete group' })
  async deleteGroup(@Param('groupId', new ValidateObjectId()) groupId: string, @Req() req): Promise<void> {
    const user: IJwtPayload = req.user;
    return this.groupService.deleteGroup(user, groupId);
  }
}

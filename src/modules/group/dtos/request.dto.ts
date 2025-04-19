import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dtos/pagination.dto';

@Exclude()
export class AddGroupRequestDto {
  @Expose()
  @ApiProperty({
    required: true,
    example: 'Group A',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @Expose()
  @ApiProperty({
    required: false,
    example: '660d46b09b4b6a001f841b1e',
  })
  @IsOptional()
  parentId?: string;
}

@Exclude()
export class UpdateGroupRequestDto {
  @Expose()
  @ApiProperty({
    type: 'string',
    required: false,
    example: 'Nhóm mới cập nhật',
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @Expose()
  @ApiProperty({
    type: 'string',
    required: false,
    example: '660d46b09b4b6a001f841b1e',
  })
  @IsOptional()
  parentId?: string;
}

@Exclude()
export class GetGroupsDto extends PaginationDto {
  @Expose()
  @ApiProperty({
    required: false,
    description: 'Search by name, subdomain or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

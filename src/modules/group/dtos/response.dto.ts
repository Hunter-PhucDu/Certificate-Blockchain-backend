import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GroupResponseDto {
  @Expose()
  @ApiProperty({ type: String, example: '660d46b09b4b6a001f841b1e' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Group A' })
  groupName: string;

  @Expose()
  @ApiProperty({ type: String, required: false, example: '660d46b09b4b6a001f841b1e' })
  parentId?: string;

  @Expose()
  @ApiProperty({ type: [String], example: ['660d46b09b4b6a001f841aaa', '660d46b09b4b6a001f841bbb'] })
  path?: string[];

  @Expose()
  @ApiProperty({ example: 1 })
  level?: number;

  @Expose()
  @ApiProperty({ example: '2025-04-09T12:34:56.789Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-04-09T12:34:56.789Z' })
  updatedAt: Date;
}

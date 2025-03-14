import { ApiProperty } from '@nestjs/swagger';
import { MetadataResponseDto } from './metadata-response.dto';

export class ListRecordSuccessResponseDto<T> {
  static dataType;
  constructor(dataType: new () => T) {
    ListRecordSuccessResponseDto.dataType = dataType;
  }

  @ApiProperty({
    required: true,
  })
  metadata: MetadataResponseDto;

  @ApiProperty({
    type: ListRecordSuccessResponseDto.dataType,
    required: true,
  })
  data: (typeof ListRecordSuccessResponseDto.dataType)[];
}

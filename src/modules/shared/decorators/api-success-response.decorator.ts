import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponseDto } from '../dtos/success-reponse.dto';
import { MetadataResponseDto } from '../dtos/metadata-response.dto';

export class ResponseDto<T = any> extends SuccessResponseDto {
  @ApiProperty({
    required: true,
  })
  data: T;
}

export class ArrayResponseDto<T = any> extends SuccessResponseDto {
  @ApiProperty({
    required: true,
    isArray: true,
  })
  data: T[];
}

export class PaginationResponseDto<T = any> extends SuccessResponseDto {
  @ApiProperty({
    required: true,
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    required: true,
    example: {
      size: 10,
      page: 1,
      totalItem: 11,
      totalPage: 2,
      hasNext: true,
      hasPrevious: false,
    },
  })
  metadata: MetadataResponseDto;
}

export function ApiSuccessResponse(options: { dataType: any; isArray?: boolean }) {
  const { dataType, isArray } = options;
  const optionDecorators = [];
  if (isArray) {
    optionDecorators.push(
      ApiResponse({
        schema: {
          $ref: getSchemaPath(ArrayResponseDto),
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(dataType),
              },
            },
          },
        },
      }),
    );
    optionDecorators.push(ApiExtraModels(ArrayResponseDto));
  } else {
    optionDecorators.push(
      ApiResponse({
        schema: {
          $ref: getSchemaPath(ResponseDto),
          properties: {
            data: {
              $ref: getSchemaPath(dataType),
            },
          },
        },
      }),
    );
    optionDecorators.push(ApiExtraModels(ResponseDto));
  }
  optionDecorators.push(ApiExtraModels(dataType));
  return applyDecorators(...optionDecorators);
}

export function ApiSuccessPaginationResponse(options: { dataType: any }) {
  const { dataType } = options;
  const optionDecorators = [];
  optionDecorators.push(
    ApiResponse({
      schema: {
        $ref: getSchemaPath(PaginationResponseDto),
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(dataType),
            },
          },
        },
      },
    }),
  );
  optionDecorators.push(ApiExtraModels(PaginationResponseDto));
  optionDecorators.push(ApiExtraModels(dataType));
  return applyDecorators(...optionDecorators);
}

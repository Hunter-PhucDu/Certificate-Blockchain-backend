import { MetadataResponseDto } from '../dtos/metadata-response.dto';

export const getPagination = (size: number, page: number, totalItem: number): MetadataResponseDto => {
  const totalPage = Math.ceil(totalItem / size);
  const hasNext = page < totalPage ? true : false;
  const hasPrevious = page > 1 ? true : false;
  return { size, page, totalItem, totalPage, hasNext, hasPrevious };
};

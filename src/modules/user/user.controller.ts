import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  UseGuards,
  Param,
  Get,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  ApiSuccessPaginationResponse,
  ApiSuccessResponse,
} from '../../modules/shared/decorators/api-success-response.decorator';
import { Roles } from '../../modules/shared/decorators/role.decorator';
import { ERole } from '../../modules/shared/enums/auth.enum';
import { JwtAuthGuard } from '../../modules/shared/gaurds/jwt.guard';
import { RolesGuard } from '../../modules/shared/gaurds/role.gaurd';
import {
  AddUserRequestDto,
  ChangePasswordRequestDto,
  GetUsersRequestDto,
  UpdateUserRequestDto,
} from './dtos/request.dto';
import { ChangePasswordResponseDto, UserResponseDto } from './dtos/response.dto';
import { UserService } from './user.service';
import { IJwtPayload } from '../../modules/shared/interfaces/auth.interface';
import { ListRecordSuccessResponseDto } from '../shared/dtos/list-record-success-response.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const userAvatarStorageConfig: MulterOptions = {
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
      const destFileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileType}`;
      cb(null, destFileName);
    },
  }),
};

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @ApiOperation({
    summary: 'Add new user',
    description: 'Add new user',
  })
  @ApiBody({
    description: 'Add new user',
    type: AddUserRequestDto,
  })
  @ApiSuccessResponse({ dataType: UserResponseDto })
  async addUser(@Body() body: AddUserRequestDto): Promise<UserResponseDto> {
    return await this.userService.addUser(body);
  }

  @Get('')
  @Roles([ERole.USER])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get user details',
    description: 'Get user details',
  })
  @ApiSuccessResponse({ dataType: UserResponseDto })
  async getUser(@Req() req): Promise<UserResponseDto> {
    const user: IJwtPayload = req.user;
    return await this.userService.getUser(user);
  }

  @Put('settings')
  @Roles([ERole.USER])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user form-data',
    type: UpdateUserRequestDto,
  })
  @UseInterceptors(FileInterceptor('avatar', userAvatarStorageConfig))
  @ApiSuccessResponse({ dataType: UserResponseDto })
  async updateUser(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: UpdateUserRequestDto,
    @Req() req,
  ): Promise<UserResponseDto> {
    const user: IJwtPayload = req.user;
    const res = await this.userService.updateUser(user, body, avatar?.filename);
    return plainToInstance(UserResponseDto, res);
  }

  @Put('change-password')
  @Roles([ERole.ADMIN, ERole.USER])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Change password user',
    description: 'Change password user',
  })
  @ApiSuccessResponse({ dataType: ChangePasswordResponseDto })
  async changePassword(@Body() body: ChangePasswordRequestDto, @Req() req): Promise<ChangePasswordResponseDto> {
    const user: IJwtPayload = req.user;
    const res = await this.userService.changePassword(user, body);
    return plainToInstance(ChangePasswordResponseDto, { newPassword: res.message });
  }

  @Get('list')
  @Roles([ERole.ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get users details',
    description: 'Get users details',
  })
  @ApiSuccessPaginationResponse({ dataType: UserResponseDto })
  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getUsers();
  }

  @Get('search')
  @Roles([ERole.ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get pagination users by search',
    description: 'Get pagination users by search',
  })
  @ApiSuccessPaginationResponse({ dataType: UserResponseDto })
  async findWithPagination(
    @Query() getUsersRequestDto: GetUsersRequestDto,
  ): Promise<ListRecordSuccessResponseDto<UserResponseDto>> {
    return await this.userService.getUsersBySearch(getUsersRequestDto);
  }

  @Delete(':userId')
  @Roles([ERole.ADMIN])
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user',
  })
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    await this.userService.deleteUser(userId);
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OrganizationService } from '../../organization/organization.service';
import { ERole } from '../enums/auth.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Lấy subdomain từ hostname
    const hostname = request.hostname;
    const subdomain = hostname.split('.')[0];

    // Nếu là SuperAdmin và không có subdomain, cho phép truy cập
    if (user.role === ERole.SUPER_ADMIN && !subdomain) {
      return true;
    }

    // Nếu có subdomain, kiểm tra organization
    if (subdomain) {
      const organization = await this.organizationService.findBySubdomain(subdomain);
      if (!organization) {
        throw new UnauthorizedException('Invalid organization');
      }

      // Gán organizationId vào request để sử dụng sau này
      request['organizationId'] = organization._id;

      // Kiểm tra quyền truy cập
      if (user.role === ERole.ORGANIZATION) {
        return user.organizationId.toString() === organization._id.toString();
      }
    }

    return false;
  }
}

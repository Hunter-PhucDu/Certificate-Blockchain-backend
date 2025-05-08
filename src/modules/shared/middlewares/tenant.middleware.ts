import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantService } from 'modules/tenant/tenant.service';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async use(req: Request, res: Response, next: (err?: any) => void) {
    try {
      const subdomain = this.extractSubdomainFromOrigin(req);

      if (!subdomain) {
        throw new NotFoundException('Subdomain not found in Origin/Referer header');
      }

      const tenant = await this.tenantService.findBySubdomain(subdomain);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
      const tenantDb = this.connection.useDb(tenantDbName, { useCache: true });

      req['tenant'] = tenant;
      req['tenantDb'] = tenantDb;
      req['subdomain'] = subdomain;

      next();
    } catch (error) {
      console.error('TenantMiddleware error:', error);
      throw new NotFoundException(`Error in TenantMiddleware: ${error.message}`);
    }
  }

  private extractSubdomainFromOrigin(req: Request): string | null {
    const origin = req.headers.origin;
    if (origin) {
      try {
        const url = new URL(origin);
        const hostname = url.hostname;
        const parts = hostname.split('.');

        if (parts.length >= 2) {
          return parts[0];
        }
      } catch (err) {
        console.error('Error parsing origin:', err);
      }
    }

    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        const hostname = url.hostname;

        const parts = hostname.split('.');
        if (parts.length >= 2) {
          return parts[0];
        }
      } catch (err) {
        console.error('Error parsing referer:', err);
      }
    }

    const host = req.headers.host;
    if (host) {
      const parts = host.split('.');
      if (parts.length >= 2) {
        return parts[0];
      }
    }

    return null;
  }
}

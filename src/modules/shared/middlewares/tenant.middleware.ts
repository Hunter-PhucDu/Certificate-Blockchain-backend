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

      next();
    } catch (error) {
      throw new NotFoundException(`Error in TenantMiddleware: ${error.message}`);
    }
  }

  private extractSubdomainFromOrigin(req: Request): string | null {
    let origin: string | undefined = req.headers.origin as string;
    if (!origin && req.headers.referer) {
      try {
        const refererUrl = new URL(req.headers.referer as string);
        origin = refererUrl.origin;
      } catch (err) {
        throw new NotFoundException(`Failed to parse Referer URL: ${req.headers.referer}`);
      }
    }

    if (origin) {
      try {
        const url = new URL(origin);
        const hostname = url.hostname;
        const parts = hostname.split('.');

        if (parts.length >= 3) {
          return parts[0];
        } else {
          throw new Error(`Hostname (${hostname}) does not have expected format`);
        }
      } catch (err) {
        throw new NotFoundException(`Failed to parse Origin URL: ${origin}`);
      }
    } else {
      throw new NotFoundException('No Origin or Referer headers available to extract subdomain');
    }

    return null;
  }
}

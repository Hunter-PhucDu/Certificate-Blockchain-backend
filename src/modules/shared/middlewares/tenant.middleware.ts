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
      console.log('===== REQUEST DEBUG INFO =====');
      console.log('Original URL:', req.originalUrl);
      console.log('Full URL:', `${req.protocol}://${req.headers.host}${req.originalUrl}`);
      console.log('Host Header:', req.headers.host);
      console.log('Hostname:', req.hostname);
      console.log('All Headers:', req.headers);
      console.log('============================');

      // Ưu tiên lấy subdomain từ header Origin hoặc Referer (nếu không có Origin)
      const subdomain = this.extractSubdomainFromOrigin(req);
      console.log('Extracted Subdomain from Origin:', subdomain);

      if (!subdomain) {
        throw new NotFoundException('Subdomain not found in Origin/Referer header');
      }

      const tenant = await this.tenantService.findBySubdomain(subdomain);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const tenantDbName = `tenant_${tenant.tenantName.replace(/\s+/g, '_').toLowerCase()}`;
      console.log('Using tenant database:', tenantDbName);

      const tenantDb = this.connection.useDb(tenantDbName, { useCache: true });

      req['tenant'] = tenant;
      req['tenantDb'] = tenantDb;

      next();
    } catch (error) {
      next(error);
    }
  }

  private extractSubdomainFromOrigin(req: Request): string | null {
    // Lấy giá trị từ header Origin
    let origin: string | undefined = req.headers.origin as string;
    if (!origin && req.headers.referer) {
      // Nếu không có Origin, thử lấy từ Referer
      try {
        const refererUrl = new URL(req.headers.referer as string);
        origin = refererUrl.origin;
      } catch (err) {
        // Bỏ qua nếu không parse được Referer
      }
    }
    if (origin) {
      try {
        const url = new URL(origin);
        const hostname = url.hostname; // Ví dụ: utb.subdomain.localhost
        const parts = hostname.split('.');
        // Giả sử cấu trúc hostname có ít nhất 3 phần (ví dụ: utb.subdomain.localhost)
        if (parts.length >= 3) {
          return parts[0]; // Lấy phần đầu tiên làm subdomain (ví dụ: "utb")
        }
      } catch (err) {
        // Bỏ qua nếu không parse được URL
      }
    }
    return null;
  }
}

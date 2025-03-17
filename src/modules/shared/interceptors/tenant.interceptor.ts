import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const organizationId = req.organizationId;

    // Nếu không có organizationId hoặc là request từ SuperAdmin, không lọc dữ liệu
    if (!organizationId || req.user?.role === 'super_admin') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Phương thức riêng để lọc dữ liệu theo tenant
        return this.filterByTenant(data, organizationId);
      }),
    );
  }

  private filterByTenant(data: any, organizationId: string): any {
    // Nếu dữ liệu là null hoặc undefined
    if (data == null) {
      return data;
    }

    // Xử lý dữ liệu dạng mảng
    if (Array.isArray(data)) {
      return data.filter((item) => !item.organizationId || item.organizationId.toString() === organizationId);
    }

    // Xử lý dữ liệu dạng pagination
    if (data.items && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.filter((item) => !item.organizationId || item.organizationId.toString() === organizationId),
      };
    }

    // Xử lý dữ liệu dạng object
    if (data.organizationId && data.organizationId.toString() !== organizationId) {
      // Nếu object thuộc về tenant khác, trả về null hoặc error
      return null;
    }

    return data;
  }
}

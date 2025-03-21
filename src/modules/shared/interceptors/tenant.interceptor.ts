// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class TenantInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const req = context.switchToHttp().getRequest();
//     const organizationId = req.organizationId;

//     if (!organizationId || req.user?.role === 'super_admin') {
//       return next.handle();
//     }

//     return next.handle().pipe(
//       map((data) => {
//         return this.filterByTenant(data, organizationId);
//       }),
//     );
//   }

//   private filterByTenant(data: any, organizationId: string): any {
//     if (data == null) {
//       return data;
//     }

//     if (Array.isArray(data)) {
//       return data.filter((item) => !item.organizationId || item.organizationId.toString() === organizationId);
//     }

//     if (data.items && Array.isArray(data.items)) {
//       return {
//         ...data,
//         items: data.items.filter((item) => !item.organizationId || item.organizationId.toString() === organizationId),
//       };
//     }

//     if (data.organizationId && data.organizationId.toString() !== organizationId) {
//       return null;
//     }

//     return data;
//   }
// }

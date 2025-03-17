// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { OrganizationModel } from '../models/organization.model';

// @Injectable()
// export class SubdomainMiddleware implements NestMiddleware {
//   constructor(private readonly organizationModel: OrganizationModel) {}

//   async use(req: Request, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const hostname = req.hostname;

//       // Bỏ qua nếu là localhost trong môi trường dev
//       if (hostname === 'localhost') {
//         return next();
//       }

//       // Tách subdomain từ hostname (vd: org.domain.com -> org)
//       const subdomainParts = hostname.split('.');

//       // Xử lý trường hợp không có subdomain
//       if (subdomainParts.length <= 2) {
//         return next();
//       }

//       const subdomain = subdomainParts[0];

//       // Bỏ qua các subdomain hệ thống
//       if (['www', 'api', 'admin'].includes(subdomain)) {
//         return next();
//       }

//       // Tìm tổ chức dựa trên subdomain
//       const organization = await this.organizationModel.model.findOne({
//         subdomain,
//         active: true,
//       });

//       if (organization) {
//         // Gắn thông tin tổ chức vào request
//         req['organizationId'] = organization._id.toString();
//         req['organization'] = {
//           id: organization._id.toString(),
//           organizationName: organization.organizationName,
//           subdomain: organization.subdomain,
//           email: organization.email,
//         };
//       }
//     } catch (error) {
//       console.error('Subdomain middleware error:', error);
//     }

//     next();
//   }
// }

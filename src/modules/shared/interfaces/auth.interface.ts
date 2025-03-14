import { ERole } from '../enums/auth.enum';

export interface IGoogleUserInfo {
  googleId: string;
  email: string;
}

export interface IJwtPayload {
  _id: string;
  username: string;
  role: ERole;
}

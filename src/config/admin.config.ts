// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { registerAs } from '@nestjs/config';

export default registerAs('superAdmin', () => ({
  username: process.env.SUPER_ADMIN_USERNAME || 'admin',
  password: process.env.SUPER_ADMIN_PASSWORD || 'admin123',
}));

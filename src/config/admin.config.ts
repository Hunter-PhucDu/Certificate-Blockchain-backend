// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { registerAs } from '@nestjs/config';

export default registerAs('admin', () => ({
  username: process.env.SUPER_ADMIN_USERNAME || 'admin',
  password: process.env.SUPER_ADMIN_PASSWORD || 'admin@admin123',
}));

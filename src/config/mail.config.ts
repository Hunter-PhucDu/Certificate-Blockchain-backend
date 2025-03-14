// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  mailAddress: process.env.AUTH_MAIL_ADDRESS,
  password: process.env.AUTH_MAIL_PASSWORD,
}));

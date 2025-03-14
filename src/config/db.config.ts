// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nong-san',
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { registerAs } from '@nestjs/config';

const localServers = [
  {
    url: `http://localhost:${process.env.APP_PORT || '3001'}`,
    description: 'Certificate server',
  },
];
const devServers = [
  {
    description: 'Certificate server',
  },
];

const prodServers = [];

const getServers = () => {
  if (process.env.APP_ENV === 'production') return prodServers;
  if (['development', 'staging'].includes(process.env.APP_ENV)) return devServers;
  return localServers;
};

export default registerAs('app', () => ({
  port: process.env.APP_PORT || 8081,
  env: process.env.NODE_ENV || 'development',
  prefix: process.env.APP_PREFIX || 'certificate-blockchain',
  name: process.env.APP_NAME || 'certificate-blockchain',
  swagger: {
    servers: getServers(),
  },
  auth: {
    jwtSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'certificate-blockchain-secret',
    jwtTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) || 86400,
  },
}));

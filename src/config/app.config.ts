require('dotenv').config();
import { registerAs } from '@nestjs/config';

const localServers = [
  {
    url: `http://localhost:${process.env.APP_PORT || '3001'}`,
    description: 'Clb Lap trinh server',
  },
];
const devServers = [
  {
    description: 'Clb Lap trinh server',
  },
];

const prodServers = [];

const getServers = () => {
  if (process.env.APP_ENV === 'production') return prodServers;
  if (['development', 'staging'].includes(process.env.APP_ENV)) return devServers;
  return localServers;
};

export default registerAs('app', () => ({
  port: process.env.APP_PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  prefix: process.env.APP_PREFIX || 'clb-lap-trinh',
  name: process.env.APP_NAME || 'clb-lap-trinh',
  swagger: {
    servers: getServers(),
  },
  auth: {
    jwtSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'clb-lap-trinh-secret',
    jwtTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) || 86400,
  },
}));

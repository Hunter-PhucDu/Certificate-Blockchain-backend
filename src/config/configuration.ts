export default () => ({
  app: {
    name: 'Certificate Blockchain Platform',
    version: '1.0.0',
    prefix: 'api/v1',
    port: parseInt(process.env.PORT, 10) || 3000,
    domain: process.env.DOMAIN || 'localhost',
    url: process.env.APP_URL || 'http://localhost:3000',
    bypassTenantInDev: process.env.BYPASS_TENANT_IN_DEV === 'true',
    swagger: {
      enabled: process.env.SWAGGER_ENABLED === 'true',
      servers: [
        {
          url: process.env.SWAGGER_URL || 'http://localhost:3000',
          description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Local Development',
        },
      ],
    },
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-blockchain',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 300,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  security: {
    rateLimiting: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
      limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
    cors: {
      enabled: true,
      origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
      credentials: true,
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    console: process.env.NODE_ENV !== 'production',
    file: process.env.NODE_ENV === 'production',
  },
});

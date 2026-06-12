export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'fintech',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    keyPrefix: process.env.REDIS_PREFIX || 'fintech:',
  },

  jwt: {
    secret: (() => {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET undefined. This is required for secure operation.');
      }
      return jwtSecret;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  idempotency: {
    ttlSeconds: parseInt(process.env.IDEMPOTENCY_TTL_SECONDS || '86400', 10), // 24h
  },

    webhookSecret: (() => {
      const webhookSecret = process.env.PARTNER_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('PARTNER_WEBHOOK_SECRET undefined. This is required for secure operation.');
      }
      return webhookSecret;
    })(),
    apiKeyHeader: process.env.PARTNER_API_KEY_HEADER || 'X-API-Key',
    webhookSecret: process.env.PARTNER_WEBHOOK_SECRET || '',
  },

  fraud: {
    defaultThreshold: parseFloat(process.env.FRAUD_THRESHOLD || '0.7'),
    rulesCacheTtl: parseInt(process.env.FRAUD_RULES_CACHE_TTL || '300', 10),
  },
});

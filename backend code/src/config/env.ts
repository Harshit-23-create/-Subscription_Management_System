import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/subscription_management'),
  AUTO_MEMORY_DB: z.string().default('true').transform((v) => v === 'true'),
  JWT_SECRET: z.string().default('production_ready_jwt_super_secret_subscription_flow_key_987654321'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  COMPANY_NAME: z.string().default('SubFlow Cloud Solutions Ltd.'),
  COMPANY_EMAIL: z.string().default('billing@subflow.io'),
  COMPANY_PHONE: z.string().default('+1 (800) 555-0199'),
  COMPANY_ADDRESS: z.string().default('742 Evergreen Terrace, Suite 500, San Francisco, CA 94107'),
  COMPANY_TAX_ID: z.string().default('US-EIN-987654321'),
  COMPANY_WEBSITE: z.string().default('https://subflow.io'),
  FRONTEND_URL: z.string().default('http://localhost:3000,http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
  ENABLE_CRON_JOBS: z.string().default('true').transform((v) => v === 'true'),
  CRON_INTERVAL_MS: z.string().default('60000').transform((v) => parseInt(v, 10)),
});

export const env = envSchema.parse(process.env);


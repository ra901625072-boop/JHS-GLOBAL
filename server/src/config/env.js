import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env first, then fallback to root/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z
    .string()
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : (process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173'))),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/export_b2b'),
  REDIS_URL: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev_jwt_access_secret_export_b2b_super_secure_key_32bytes_min'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev_jwt_refresh_secret_export_b2b_super_secure_key_32bytes_min'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('JHS GLOBAL <info.jhsglobal@gmail.com>'),
  LLM_PROVIDER: z.enum(['mock', 'openai', 'anthropic', 'gemini']).default('mock'),
  LLM_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
  DAILY_AI_BUDGET_USD: z.coerce.number().default(5.0),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error('Invalid environment variables detected:', parsed.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = parsed.data;
export default env;

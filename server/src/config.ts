import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4040),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_MASTER_KEY: z.string().min(32),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5.6-luna'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:8081'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const config = schema.parse(process.env);

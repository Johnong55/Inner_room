import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { reflectionRouter } from './routes/reflections.js';
import { syncRouter } from './routes/sync.js';
import { searchRouter } from './routes/search.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.ALLOWED_ORIGINS.split(',').map((item) => item.trim()), methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'innerroom-api' }));
app.use('/v1/auth', authRouter);
app.use('/v1/reflections', reflectionRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/sync', syncRouter);
app.use('/v1/me', meRouter);
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = Number((error as { status?: number }).status) || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'INTERNAL_ERROR' : (error as Error).message });
};
app.use(errorHandler);

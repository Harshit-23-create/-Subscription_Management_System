import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';
import docsRoutes from './routes/docs.routes';
import { NotFoundError } from './utils/errors';

export const createApp = (): Application => {
  const app = express();

  // Security and performance middleware
  app.use(helmet({ contentSecurityPolicy: false })); // allows swagger UI
  app.use(
    cors({
      origin: env.FRONTEND_URL.split(',').map((u) => u.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );
  app.use(compression());

  // Request correlation ID
  app.use(requestIdMiddleware);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP access logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms [req-id: :req[x-request-id]]'));
  }

  // API Documentation (Swagger UI & OpenAPI Spec)
  app.use('/api', docsRoutes);

  // Mount API v1 router
  app.use(env.API_PREFIX, apiRoutes);

  // Root welcome route
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Subscription Management System API',
      status: 'Online',
      documentation: '/api/docs',
      apiBase: env.API_PREFIX,
      version: '1.0.0',
    });
  });

  // 404 Handler for undefined routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};


import express from 'express';
import cors from 'cors'
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser'
import { config } from '../config/index.js';
import { AppError } from './utils/appError.js';
import httpLogger from './utils/appLogger.js';
import globalErrorHandler from './middlewares/globalError.mid.js';
import { corsOptions } from '../config/cors.js';


const app = express();

// Trust the first proxy (Nginx) so req.ip reflects the real client IP via X-Forwarded-For
app.set('trust proxy', 1);

app.use(cors(corsOptions));

app.use(cookieParser())
app.use(httpLogger);
app.use(rateLimit(config.GLOBAL_RATE_LIMIT_CONFIG));
app.use(rateLimit(config.PER_IP_RATE_LIMIT_CONFIG));
app.use(express.json());

// Routes
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { swaggerUi, swaggerSpec } from '../config/swagger.js';

// API routes
const api = express.Router();

app.use('/', indexRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

api.use('/auth', authRoutes);
api.use('/tasks', taskRoutes);
api.use('/admin', adminRoutes);

app.use(`/api/v${config.VERSION.split(".")[0]}`, api);

// 404 handler for undefined routes
app.use((_, __, next) => {
  next(new AppError({ statusCode: 404, message: 'Route not found' }));
});

app.use(globalErrorHandler);
export default app;

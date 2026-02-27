import { Router } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import appResponse from '../utils/appResponse.js';
import { config } from '../../config/index.js';

const router = Router();

const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     description: Returns detailed server health info including uptime, memory usage, database state, and environment.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server is healthy
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: UP
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     environment:
 *                       type: string
 *                       example: development
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     uptime:
 *                       type: object
 *                       properties:
 *                         process:
 *                           type: string
 *                           example: 0h 5m 12s
 *                         system:
 *                           type: string
 *                           example: 3h 20m 45s
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         host:
 *                           type: string
 *                           example: localhost
 *                         name:
 *                           type: string
 *                           example: primetrade
 *                     memory:
 *                       type: object
 *                       properties:
 *                         heapUsed:
 *                           type: string
 *                           example: 45.23 MB
 *                         heapTotal:
 *                           type: string
 *                           example: 67.50 MB
 *                         rss:
 *                           type: string
 *                           example: 80.00 MB
 *                         external:
 *                           type: string
 *                           example: 1.20 MB
 */
router.get('/health', (req, res) => {
  const mem = process.memoryUsage();
  const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

  const processSecs = Math.floor(process.uptime());
  const processUptime = `${Math.floor(processSecs / 3600)}h ${Math.floor((processSecs % 3600) / 60)}m ${processSecs % 60}s`;

  const systemSecs = Math.floor(os.uptime());
  const systemUptime = `${Math.floor(systemSecs / 3600)}h ${Math.floor((systemSecs % 3600) / 60)}m ${systemSecs % 60}s`;

  const dbState = mongoose.connection.readyState;

  appResponse(res, {
    message: 'Server is healthy',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: config.VERSION,
      uptime: {
        process: processUptime,
        system: systemUptime,
      },
      database: {
        status: DB_STATES[dbState] ?? 'unknown',
        host: mongoose.connection.host ?? 'N/A',
        name: mongoose.connection.name ?? 'N/A',
      },
      memory: {
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        rss: toMB(mem.rss),
        external: toMB(mem.external),
      },
    },
  });
});

export default router;
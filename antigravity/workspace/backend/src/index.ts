import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ohlcvRouter } from './routes/ohlcv';
import { indicatorRouter } from './routes/indicators';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/ohlcv', ohlcvRouter);
app.use('/api/v1/indicators', indicatorRouter);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QuantLab API running at http://localhost:${PORT}`);
    console.log(`📊 OHLCV endpoint: http://localhost:${PORT}/api/v1/ohlcv/:symbol`);
    console.log(`📈 Indicators endpoint: http://localhost:${PORT}/api/v1/indicators`);
});

export default app;

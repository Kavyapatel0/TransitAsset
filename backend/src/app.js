import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Global fix for MySQL returning BigInts (like COUNT(*)) which crashes JSON.stringify
BigInt.prototype.toJSON = function () {
  return Number(this);
};

// Routes
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
    ].filter(Boolean);

    // Allow Vercel preview deployments (*.vercel.app)
    const isVercel = origin && /https:\/\/.*\.vercel\.app$/.test(origin);

    if (!origin || allowed.includes(origin) || isVercel) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'TransitAsset API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);


// 404 + Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

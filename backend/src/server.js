import app from './app.js';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`✓ TransitAsset Backend Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API Base: http://localhost:${PORT}/api`);
  });
};

start().catch(err => { console.error('Failed to start server:', err.message); process.exit(1); });

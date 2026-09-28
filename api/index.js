// Vercel Serverless Function entry point
// This re-exports the Express app for Vercel's serverless runtime

import app from '../backend/src/app.js';

export default app;

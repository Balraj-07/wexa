
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

import {
  closeDriver,
  verifyConnection,
  isConfigured,
} from './config/database.js';

const port = process.env.PORT || 4000;

const server = app.listen(port, async () => {
  console.log(`CareerGraph API listening on :${port}`);

  if (!isConfigured()) {
    console.warn('CognoDB environment variables are not configured.');
    return;
  }

  try {
    const result = await verifyConnection();

    console.log('✅ CognoDB connection verified.');
    console.log('Database test result:', result);
  } catch (error) {
    console.error('❌ CognoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    console.warn(
      'CognoDB unavailable: API will return a friendly 503 until it reconnects.'
    );
  }
});

async function shutdown() {
  console.log('Shutting down CareerGraph API...');

  server.close(async () => {
    try {
      await closeDriver();
      console.log('CognoDB driver closed.');
    } catch (error) {
      console.error('Error closing CognoDB:', error.message);
    }

    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

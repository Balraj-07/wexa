import app from './app.js'; import { closeDriver, verifyConnection, isConfigured } from './config/database.js';
const port=process.env.PORT || 4000; app.listen(port,()=>console.log(`CareerGraph API listening on :${port}`));
if(isConfigured()) verifyConnection().then(()=>console.log('CognoDB connection verified.')).catch(()=>console.warn('CognoDB unavailable: API will return a friendly 503 until it reconnects.'));
else console.warn('CognoDB environment variables are not configured.');
process.on('SIGTERM',()=>closeDriver().finally(()=>process.exit(0)));

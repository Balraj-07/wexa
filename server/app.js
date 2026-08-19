import express from 'express'; import cors from 'cors'; import helmet from 'helmet';
import api from './routes/api.js'; import { notFound,errorHandler } from './middleware/errors.js';
const app=express(); app.use(helmet()); app.use(cors({origin:process.env.CLIENT_ORIGIN?.split(',') || true})); app.use(express.json()); app.use('/api',api); app.use(notFound); app.use(errorHandler); export default app;

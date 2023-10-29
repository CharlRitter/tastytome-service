import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { enumRoutes } from '@/routes/enumRoutes';
import { memberRoutes } from '@/routes/memberRoutes';
import { recipeRoutes } from '@/routes/recipeRoutes';
import { logger } from '@/utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Set up CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Use the existing CORS middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    exposedHeaders: 'Authorization,Content-Range,set-cookie',
    maxAge: 300,
    credentials: true
  })
);
app.use(cookieParser());

// Mount routes
app.use(enumRoutes);
app.use(memberRoutes);
app.use(recipeRoutes);

app.listen(port, () => logger.info(`Server is running at http://localhost:${port}`));

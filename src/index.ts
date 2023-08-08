import express, { Express } from 'express';
import dotenv from 'dotenv';
import Logger from '@/utils/logger';
import enumRoutes from '@/routes/enumRoutes';
import memberRoutes from '@/routes/memberRoutes';
import recipeRoutes from '@/routes/recipeRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;
const logger = new Logger();

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use(enumRoutes);
app.use(memberRoutes);
app.use(recipeRoutes);

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import Logger from '@/utils/logger';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const logger = new Logger();

// TODO example
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

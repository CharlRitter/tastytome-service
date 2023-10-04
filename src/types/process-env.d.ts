import { Secret } from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_SECRET: Secret;
      DATABASE_URL: string;
    }
  }
}

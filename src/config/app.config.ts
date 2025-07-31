import { registerAs } from '@nestjs/config';

export type AppConfig = {
  dbUrl?: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export default registerAs<AppConfig>('app', () => ({
  dbUrl: process.env.MONGODB_URI,
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  webKey: process.env.FIREBASE_WEB_KEY,
}));

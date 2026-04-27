import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static images from /public folder at /uploads URL
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/uploads' });

  // CORS: read allowed origins from env (comma-separated), default to allow all
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins && corsOrigins !== '*') {
    app.enableCors({ origin: corsOrigins.split(',').map(o => o.trim()), credentials: true });
  } else {
    app.enableCors();
  }

  const port = process.env.API_PORT || process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Shopperz Mart API running on: http://0.0.0.0:${port}`);
  console.log(`📦 Static files served at: http://0.0.0.0:${port}/uploads/`);
}
bootstrap();


import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
  
  app.use((req: Request, res: Response, next: NextFunction) => {
  const openPaths = ['/health'];

  if (openPaths.includes(req.path)) {
    return next();
  }

  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    return res.status(400).json({ error: 'x-tenant-id header required' });
  }

  (req as any).tenantId = tenantId;
  next();
});

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');

}

bootstrap();

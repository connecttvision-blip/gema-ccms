import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'x-tenant-id header required' });
    }

    (req as any).tenantId = tenantId;
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppConfig } from './config/config.schema';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });

  const configService = app.get(ConfigService<AppConfig>);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const host = configService.get('API_HOST', { infer: true }) ?? '0.0.0.0';
  const port = configService.get('API_PORT', { infer: true }) ?? 4000;

  await app.listen(port, host);
}

void bootstrap();

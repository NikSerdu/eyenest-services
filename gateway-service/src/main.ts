import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './core/app.module';
import { getCorsConfig, getValidationPipeConfig } from './core/config';
import { GrpcExceptionFilter } from './shared/filters';
import cookieParser from 'cookie-parser';
import express from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpServer = app.getHttpAdapter().getInstance();
  if (typeof httpServer.set === 'function') {
    httpServer.set('trust proxy', 1);
  }
  app.use(express.raw({ type: 'application/webhook+json' }));
  const config = app.get(ConfigService);
  const logger = new Logger();
  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));

  app.useGlobalFilters(new GrpcExceptionFilter());

  app.enableCors(getCorsConfig(config));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EyeNest API')
    .setDescription('API Gateway for EyeNest microservices')
    .setVersion('1.0.0')
    .addCookieAuth('accessToken', {
      type: 'apiKey',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
    })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('/docs', app, swaggerDocument, {
    yamlDocumentUrl: '/openapi.yaml',
    swaggerOptions: {
      withCredentials: true,
    },
  });

  const port = config.getOrThrow<number>('HTTP_PORT');
  const host = config.getOrThrow<string>('HTTP_HOST');

  await app.listen(port);

  logger.log(`🚀 Gateway started: ${host}`);
  logger.log(`📚 Swagger: ${host}/docs`);
}
bootstrap();

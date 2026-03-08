import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './core/app.module';
import { getCorsConfig, getValidationPipeConfig } from './core/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const logger = new Logger();
  app.useGlobalPipes(new ValidationPipe(getValidationPipeConfig()));

  app.enableCors(getCorsConfig(config));

  const port = config.getOrThrow<number>('HTTP_PORT');
  const host = config.getOrThrow<string>('HTTP_HOST');

  await app.listen(port);

  logger.log(`🚀 Gateway started: ${host}`);
  logger.log(`📚 Swagger: ${host}/docs`);
}
bootstrap();

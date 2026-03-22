import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { createGrpcServer } from './infrastructure/grpc/grpc.server';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  createGrpcServer(app, config);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>('RMQ_URL')],
      queue: config.getOrThrow<string>('RMQ_VIDEO_QUEUE'),
      queueOptions: { durable: true },
      exchange: config.getOrThrow<string>('RMQ_EVENTS_EXCHANGE'),
      exchangeType: 'topic',
      wildcards: true,
    },
  });
  await app.startAllMicroservices();
}
bootstrap();

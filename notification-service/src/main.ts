import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createGrpcServer } from './infrastructure/grpc/grpc.server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  createGrpcServer(app, config);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>('RMQ_URL')],
      queue: config.getOrThrow<string>('RMQ_NOTIFICATIONS_QUEUE'),
      queueOptions: { durable: true },
      exchange: config.getOrThrow<string>('RMQ_EVENTS_EXCHANGE'),
      exchangeType: 'topic',
      wildcards: true,
    },
  });

  await app.init();
  await app.startAllMicroservices();
}
bootstrap();

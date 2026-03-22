import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Global } from '@nestjs/common';
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RMQ_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RMQ_URL')],
            queue: config.getOrThrow<string>('RMQ_EVENT_QUEUE'),
            queueOptions: { durable: true },
            exchange: config.getOrThrow<string>('RMQ_EVENTS_EXCHANGE'),
            exchangeType: 'topic',
            wildcards: true,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqModule {}

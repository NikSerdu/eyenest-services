import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RmqModule } from './infrastructure/rmq/rmq.module';
import { EventsModule } from './presentation/events/events.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
    }),

    PrismaModule,
    RmqModule,
    EventsModule,
  ],
})
export class AppModule {}

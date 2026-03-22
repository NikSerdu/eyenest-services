import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RecordingsModule } from './presentation/recordings/recordings.module';
import { RmqModule } from './infrastructure/rmq/rmq.module';
import { RedisModule } from './infrastructure/redis/redis.module';
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
    RecordingsModule,
    RmqModule,
    RedisModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CameraModule } from './presentation/camera/camera.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './shared';
import { VideoModule } from './presentation/video/video.module';
import { RmqModule } from './infrastructure/rmq/rmq.module';
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
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    PrismaModule,
    CameraModule,
    RedisModule,
    VideoModule,
    RmqModule,
  ],
})
export class AppModule {}

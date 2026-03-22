import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from 'src/shared/strategies/jwt.strategy';
import { CameraModule } from '@/modules/camera/camera.module';
import { LiveKitModule } from '@/modules/live_kit/live_kit.module';
import { RmqModule } from './modules/rmq/rmq.module';
import { VideoModule } from '@/modules/video/video.module';
import { EventsModule } from '@/modules/events/events.module';

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
    AuthModule,
    CameraModule,
    VideoModule,
    LiveKitModule,
    EventsModule,
    RmqModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}

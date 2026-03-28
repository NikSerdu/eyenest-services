import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PROTO_PATHS } from '@eyenest/contracts';
import { ICameraService } from '@/domain/services/camera.service';
import { CameraService } from '@/infrastructure/services/camera.service';
import { SendDetectionNotificationUseCase } from '@/application/useCases/sendDetectionNotificationUseCase.useCase';
import { EventEmitterModule } from '@eyenest/common';
import { CameraClientGrpc } from '@/infrastructure/grpc/clients/camera.grpc';
import { AuthClientGrpc } from '@/infrastructure/grpc/clients/auth.grpc';
import { IUserService } from '@/domain/services/user.service';
import { UserService } from '@/infrastructure/services/user.service';
import { ITelegramService } from '@/domain/services/telegram.service';
import { TelegramService } from '@/infrastructure/services/telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { IEmailService } from '@/domain/services/email.service';
import { EmailService } from '@/infrastructure/services/email.service';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { LinkChatIdUseCase } from '@/application/useCases/linkChatIdUseCase.useCase';
import { GetLinkTokenUseCase } from '@/application/useCases/getLinkTokenUseCase.useCase';
import { UnlinkTelegramUseCase } from '@/application/useCases/unlinkTelegram.useCase';
import { BotUpdate } from './bot.update';
import { session } from 'telegraf';
@Module({
  imports: [
    RedisModule,
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow('TELEGRAM_BOT_TOKEN'),
        middlewares: [session()],
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.register('RMQ_CLIENT'),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth.v1',
            protoPath: PROTO_PATHS.AUTH,
            url: configService.getOrThrow('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CAMERA_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'camera.v1',
            protoPath: PROTO_PATHS.CAMERA,
            url: configService.getOrThrow('CAMERA_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: ICameraService,
      useClass: CameraService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: ITelegramService,
      useClass: TelegramService,
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
    AuthClientGrpc,
    CameraClientGrpc,
    SendDetectionNotificationUseCase,
    LinkChatIdUseCase,
    GetLinkTokenUseCase,
    UnlinkTelegramUseCase,
    BotUpdate,
  ],
})
export class NotificationModule {}

import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { SendDetectionNotificationUseCase } from '@/application/useCases/sendDetectionNotificationUseCase.useCase';
import { type EventPayload, Events } from '@eyenest/common';
import type {
  LinkTokenRequest,
  UnlinkTelegramAccountRequest,
} from '@eyenest/contracts/gen/ts/notifications';
import { GetLinkTokenUseCase } from '@/application/useCases/getLinkTokenUseCase.useCase';
import { UnlinkTelegramUseCase } from '@/application/useCases/unlinkTelegram.useCase';
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly sendDetectionNotificationUseCase: SendDetectionNotificationUseCase,
    private readonly getLinkTokenUseCase: GetLinkTokenUseCase,
    private readonly unlinkTelegramUseCase: UnlinkTelegramUseCase,
  ) {}

  @GrpcMethod('NotificationsService', 'GetLinkToken')
  async getLinkToken(data: LinkTokenRequest) {
    return await this.getLinkTokenUseCase.execute(data.userId);
  }

  @GrpcMethod('NotificationsService', 'UnlinkTelegramAccount')
  async unlinkTelegramAccount(data: UnlinkTelegramAccountRequest) {
    return await this.unlinkTelegramUseCase.execute(data);
  }

  @EventPattern(Events.MOTION_DETECTED)
  async sendDetectionNotification(data: EventPayload<Events.MOTION_DETECTED>) {
    return await this.sendDetectionNotificationUseCase.execute(data.cameraId);
  }
}

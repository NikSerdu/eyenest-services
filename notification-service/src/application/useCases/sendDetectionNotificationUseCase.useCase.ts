import { ICameraService } from '@/domain/services/camera.service';
import { IEmailService } from '@/domain/services/email.service';
import { ITelegramService } from '@/domain/services/telegram.service';
import { IUserService } from '@/domain/services/user.service';
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/infrastructure/redis/redis.service';

@Injectable()
export class SendDetectionNotificationUseCase {
  constructor(
    private readonly cameraService: ICameraService,
    private readonly userService: IUserService,
    private readonly telegramService: ITelegramService,
    private readonly emailService: IEmailService,
    private readonly redis: RedisService,
  ) {}

  async execute(cameraId: string) {
    const isCooldown = await this.telegramService.processCooldown(cameraId);
    if (isCooldown) {
      return;
    }

    const cameraUserId =
      await this.cameraService.getCameraUserIdByCameraId(cameraId);
    const userNotificationSettings =
      await this.userService.getUserNotificationSettings(cameraUserId);
    const user = await this.userService.getUserById(cameraUserId);
    const { camera } = await this.cameraService.getCameraByCameraId(cameraId);
    camera;
    if (
      userNotificationSettings.telegramEnabled &&
      userNotificationSettings.telegramChatId
    ) {
      await this.telegramService.sendNotification(
        userNotificationSettings.telegramChatId,
        `Обнаружено движение на камере ${camera?.name}`,
      );
    }
    if (userNotificationSettings.emailEnabled) {
      await this.emailService.sendNotification(
        user.email,
        `Обнаружено движение на камере ${camera?.name}`,
      );
    }
  }
}

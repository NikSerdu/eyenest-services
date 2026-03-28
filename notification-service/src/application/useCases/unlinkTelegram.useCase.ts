import { ITelegramService } from '@/domain/services/telegram.service';
import { IUserService } from '@/domain/services/user.service';
import { RpcStatus } from '@eyenest/common';
import {
  UnlinkTelegramAccountRequest,
  UnlinkTelegramAccountResponse,
} from '@eyenest/contracts/gen/ts/notifications';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UnlinkTelegramUseCase {
  constructor(
    private readonly userService: IUserService,
    private readonly telegramService: ITelegramService,
  ) {}

  async execute(
    data: UnlinkTelegramAccountRequest,
  ): Promise<UnlinkTelegramAccountResponse> {
    const { userId, telegramChatId } = data;
    if (!userId && !telegramChatId) {
      throw new Error('User ID or Telegram chat ID is required');
    }
    if (userId) {
      await this.userService.updateUserNotificationSettings({
        userId,
        telegramChatId: '',
      });
    }
    if (telegramChatId) {
      const { userId } =
        await this.userService.getUserIdByTelegramChatId(telegramChatId);
      if (!userId) {
        throw new RpcException({
          code: RpcStatus.NOT_FOUND,
          details: 'Пользователь не найден!',
        });
      }
      await this.userService.updateUserNotificationSettings({
        userId: userId,
        telegramChatId: '',
      });
    }
    return { success: true };
  }
}

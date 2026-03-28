import { ITelegramService } from '@/domain/services/telegram.service';
import { IUserService } from '@/domain/services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkChatIdUseCase {
  constructor(
    private readonly userService: IUserService,
    private readonly telegramService: ITelegramService,
  ) {}

  async execute(token: string | undefined, chatId: number | undefined) {
    if (!token) {
      return '❌ Токен не передан';
    }
    if (!chatId) {
      return '❌ Нет доступа к чату';
    }
    const userId = await this.telegramService.getUserIdByToken(token);
    if (!userId) {
      return '❌ Токен неверный или истек срок действия';
    }
    const userSettings =
      await this.userService.getUserNotificationSettings(userId);
    await this.userService.updateUserNotificationSettings({
      userId: userId,
      telegramEnabled: userSettings.telegramEnabled,
      telegramChatId: chatId.toString(),
      emailEnabled: userSettings.emailEnabled,
    });
    return '✅ Аккаунт успешно привязан';
  }
}

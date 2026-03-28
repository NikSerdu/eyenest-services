import {
  GetUserByIdResponse,
  GetUserIdByTelegramChatIdResponse,
  GetUserNotificationSettingsResponse,
  UpdateUserNotificationSettingsRequest,
  UpdateUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth';

export abstract class IUserService {
  abstract getUserNotificationSettings(
    userId: string,
  ): Promise<GetUserNotificationSettingsResponse>;
  abstract getUserById(userId: string): Promise<GetUserByIdResponse>;
  abstract updateUserNotificationSettings(
    data: UpdateUserNotificationSettingsRequest,
  ): Promise<UpdateUserNotificationSettingsResponse>;
  abstract getUserIdByTelegramChatId(
    telegramChatId: string,
  ): Promise<GetUserIdByTelegramChatIdResponse>;
}

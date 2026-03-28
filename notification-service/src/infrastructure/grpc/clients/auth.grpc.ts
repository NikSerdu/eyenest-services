import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  AuthServiceClient,
  GetUserByIdResponse,
  GetUserIdByTelegramChatIdResponse,
  GetUserNotificationSettingsResponse,
  UpdateUserNotificationSettingsRequest,
  UpdateUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthClientGrpc {
  private authService: AuthServiceClient | null = null;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  private get service(): AuthServiceClient {
    if (!this.authService) {
      this.authService =
        this.client.getService<AuthServiceClient>('AuthService');
    }

    return this.authService;
  }

  async getUserNotificationSettings(
    userId: string,
  ): Promise<GetUserNotificationSettingsResponse> {
    const response = await firstValueFrom(
      this.service.getUserNotificationSettings({ userId }),
    );
    return response;
  }

  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    const response = await firstValueFrom(this.service.getUserById({ userId }));
    return response;
  }

  async updateUserNotificationSettings(
    data: UpdateUserNotificationSettingsRequest,
  ): Promise<UpdateUserNotificationSettingsResponse> {
    const response = await firstValueFrom(
      this.service.updateUserNotificationSettings(data),
    );
    return response;
  }
  async getUserIdByTelegramChatId(
    telegramChatId: string,
  ): Promise<GetUserIdByTelegramChatIdResponse> {
    const response = await firstValueFrom(
      this.service.getUserIdByTelegramChatId({ telegramChatId }),
    );
    return response;
  }
}

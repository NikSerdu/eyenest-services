import { Injectable } from '@nestjs/common';
import { IUserService } from '@/domain/services/user.service';
import { AuthClientGrpc } from '../grpc/clients/auth.grpc';
import {
  GetUserByIdResponse,
  GetUserIdByTelegramChatIdResponse,
  GetUserNotificationSettingsResponse,
  UpdateUserNotificationSettingsRequest,
  UpdateUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly authClientGrpc: AuthClientGrpc) {}

  async getUserNotificationSettings(
    userId: string,
  ): Promise<GetUserNotificationSettingsResponse> {
    return await this.authClientGrpc.getUserNotificationSettings(userId);
  }

  async getUserById(userId: string): Promise<GetUserByIdResponse> {
    return await this.authClientGrpc.getUserById(userId);
  }

  async updateUserNotificationSettings(
    data: UpdateUserNotificationSettingsRequest,
  ): Promise<UpdateUserNotificationSettingsResponse> {
    console.log('not service', data);
    return await this.authClientGrpc.updateUserNotificationSettings(data);
  }

  async getUserIdByTelegramChatId(
    telegramChatId: string,
  ): Promise<GetUserIdByTelegramChatIdResponse> {
    return await this.authClientGrpc.getUserIdByTelegramChatId(telegramChatId);
  }
}

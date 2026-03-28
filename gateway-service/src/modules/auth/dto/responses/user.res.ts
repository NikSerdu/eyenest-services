import { ApiProperty } from '@nestjs/swagger';

export class GetUserNotificationSettingsResponse {
  @ApiProperty()
  telegramEnabled: boolean;
  @ApiProperty()
  telegramChatId: string;
  @ApiProperty()
  emailEnabled: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserNotificationSettingsRequest {
  @ApiProperty()
  @IsBoolean()
  telegramEnabled: boolean;
  @ApiProperty()
  @IsBoolean()
  emailEnabled: boolean;
}

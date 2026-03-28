import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  GetLinkTelegramTokenResponse,
  UnlinkTelegramAccountResponse,
} from './dto';
import { Auth, Current } from '@/shared';
import { NotificationsClientGrpc } from '@/core/grpc-clients/notifications.grpc';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsClientGrpc) {}

  @ApiOperation({
    summary: 'Get link telegram token',
  })
  @ApiOkResponse({
    type: GetLinkTelegramTokenResponse,
    isArray: true,
  })
  @Auth('user')
  @HttpCode(HttpStatus.OK)
  @Get('getLinkTelegramToken')
  async getLinkTelegramToken(@Current('user') userId: string) {
    return await this.notifications.call('getLinkToken', {
      userId,
    });
  }

  @ApiOperation({
    summary: 'Unlink Telegram account',
  })
  @ApiOkResponse({
    type: UnlinkTelegramAccountResponse,
  })
  @Auth('user')
  @HttpCode(HttpStatus.OK)
  @Delete('unlinkTelegram')
  async unlinkTelegram(@Current('user') userId: string) {
    return await this.notifications.call('unlinkTelegramAccount', {
      userId,
    });
  }
}

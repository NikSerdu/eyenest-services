import { ITelegramService } from '@/domain/services/telegram.service';
import { IUserService } from '@/domain/services/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetLinkTokenUseCase {
  constructor(
    private readonly userService: IUserService,
    private readonly telegramService: ITelegramService,
  ) {}

  async execute(userId: string) {
    const token = await this.telegramService.getLinkToken(userId);
    return { token };
  }
}

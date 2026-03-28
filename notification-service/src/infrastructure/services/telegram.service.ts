import { ITelegramService } from '@/domain/services/telegram.service';
import { InjectBot } from 'nestjs-telegraf';
import { randomBytes } from 'node:crypto';
import { Telegraf, Scenes } from 'telegraf';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
export class TelegramService implements ITelegramService {
  constructor(
    @InjectBot() private bot: Telegraf<Scenes.SceneContext>,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}
  async sendNotification(chatId: string, message: string): Promise<void> {
    await this.bot.telegram.sendMessage(chatId, message);
  }

  async getLinkToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.redis.set(`link:token:${token}`, userId, 'EX', 300);
    return token;
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    const userId = await this.redis.get(`link:token:${token}`);
    if (!userId) {
      return null;
    }
    this.redis.del(`link:token:${token}`);
    return userId;
  }

  async processCooldown(cameraId: string): Promise<boolean> {
    const cooldownSec = this.config.getOrThrow<number>(
      'MOTION_NOTIFICATION_COOLDOWN_SEC',
    );
    const dedupeKey = `notifications:motion:camera:${cameraId}`;
    const lock = await this.redis.set(
      dedupeKey,
      Date.now().toString(),
      'EX',
      cooldownSec,
      'NX',
    );

    return lock !== 'OK';
  }
}

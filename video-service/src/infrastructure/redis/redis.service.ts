import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);

  public constructor(private readonly configService: ConfigService) {
    super({
      username: configService.getOrThrow('REDIS_USER'),
      password: configService.getOrThrow('REDIS_PASSWORD'),
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow('REDIS_PORT'),
      db: parseInt(configService.getOrThrow('REDIS_DB')),
      maxRetriesPerRequest: 5,
      enableOfflineQueue: true,
    });
  }

  public async onModuleInit() {
    const start = Date.now();

    this.logger.log('Initializing Redis connection..');

    this.on('connect', () => {
      this.logger.log('Redis connecting...');
    });

    this.on('ready', () => {
      const ms = Date.now() - start;
      this.logger.log(`Redis connected (time=${ms}ms)`);
    });

    this.on('error', (error) => {
      this.logger.error('Redis error', {
        error: error.message ?? error,
      });
    });

    this.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.on('reconnecting', () => {
      this.logger.log('Redis reconnecting...');
    });
  }

  public async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');

    try {
      await this.quit();

      this.logger.log('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection: ', error);
    }
  }
}

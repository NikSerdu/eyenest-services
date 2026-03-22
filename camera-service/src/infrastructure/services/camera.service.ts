import { ICameraService } from '@/domain/services/camera.service';
import {
  AddCameraRequest,
  AddCameraResponse,
  LinkCameraResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { RedisService } from '../redis/redis.service';
import { randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import {
  EventPayload,
  RmqEventMap,
  RpcStatus,
  TypedEventEmitter,
} from '@eyenest/common';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ITokenVerify } from '@/shared/types/jwt.interface';

@Injectable()
export class CameraService implements ICameraService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emitter: TypedEventEmitter,
  ) {}
  async getCameraTempToken(
    data: Omit<AddCameraRequest, 'userId'>,
  ): Promise<AddCameraResponse> {
    const token = randomBytes(32).toString('hex');

    await this.redis.set(
      `camera:temp:${token}`,
      JSON.stringify({
        name: data.name,
        locationId: data.locationId,
      }),
      'EX',
      300,
    );

    return {
      token,
    };
  }

  async findCameraByToken(
    token: string,
  ): Promise<Omit<AddCameraRequest, 'userId'>> {
    const data = await this.redis.get(`camera:temp:${token}`);
    if (!data) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Неверный код или срок жизни кода истёк!',
      });
    }
    this.redis.del(`camera:temp:${token}`);
    return JSON.parse(data);
  }

  async getCameraTokens(cameraId: string): Promise<LinkCameraResponse> {
    const accessToken = await this.jwt.signAsync({
      sub: cameraId,
    });
    const refreshToken = await this.jwt.signAsync(
      {
        sub: cameraId,
      },
      {
        expiresIn: this.config.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES'),
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  async verifyToken(refreshToken: string): Promise<ITokenVerify> {
    try {
      const data = await this.jwt.verifyAsync(refreshToken);
      return {
        isValid: true,
        cameraId: data.sub,
      };
    } catch (error) {
      return {
        isValid: false,
        cameraId: null,
      };
    }
  }
  async emitEvent<T extends keyof RmqEventMap>(
    event: T,
    data: EventPayload<T>,
  ): Promise<void> {
    this.emitter.emit(event, data);
  }
  async checkCameraOnline(cameraId: string): Promise<boolean> {
    const isCameraOnline = Boolean(
      await this.redis.get(`camera:online:${cameraId}`),
    );
    return isCameraOnline;
  }

  async setCameraOnline(cameraId: string): Promise<void> {
    await this.redis.set(`camera:online:${cameraId}`, 'true', 'EX', 300);
  }

  async setCameraOffline(cameraId: string): Promise<void> {
    await this.redis.del(`camera:online:${cameraId}`);
  }
}

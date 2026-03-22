import { ICameraService } from '@/domain/services/camera.service';
import { RedisService } from '../redis/redis.service';
import { Injectable } from '@nestjs/common';
``;

@Injectable()
export class CameraService implements ICameraService {
  constructor(private readonly redis: RedisService) {}
  async checkCameraOnline(cameraId: string): Promise<boolean> {
    const isCameraOnline = Boolean(
      await this.redis.get(`camera:online:${cameraId}`),
    );
    return isCameraOnline;
  }
}

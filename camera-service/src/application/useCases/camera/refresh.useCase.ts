import { RefreshRequest } from '@eyenest/contracts/gen/ts/auth';
import { RpcException } from '@nestjs/microservices';
import { RpcStatus } from '@eyenest/common';
import { Injectable } from '@nestjs/common';
import { ICameraService } from '@/domain/services/camera.service';

@Injectable()
export class RefreshUseCase {
  constructor(private readonly cameraService: ICameraService) {}

  async execute(data: RefreshRequest) {
    const result = await this.cameraService.verifyToken(data.refreshToken);
    if (!result.isValid || !result.cameraId) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Неверный токен!',
      });
    }

    return await this.cameraService.getCameraTokens(result.cameraId);
  }
}

import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { RpcStatus } from '@eyenest/common';
import {
  GetLinkCameraTokenRequest,
  GetLinkCameraTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GetLinkCameraTokenUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(
    data: GetLinkCameraTokenRequest,
  ): Promise<GetLinkCameraTokenResponse> {
    const userId = await this.cameraRepository.getUserIdByCameraId(
      data.cameraId,
    );
    if (userId !== data.userId) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Вы не имеете доступа к этой камере!',
      });
    }
    const camera = await this.cameraRepository.getCameraById(data.cameraId);
    if (!camera) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
    return await this.cameraService.getCameraTempToken({
      name: camera.name,
      locationId: camera.location.id,
    });
  }
}

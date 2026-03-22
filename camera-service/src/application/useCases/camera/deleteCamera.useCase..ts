import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { Events, RpcStatus } from '@eyenest/common';
import {
  DeleteCameraRequest,
  DeleteCameraResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DeleteCameraUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: DeleteCameraRequest): Promise<DeleteCameraResponse> {
    const camera = await this.cameraRepository.deleteCamera(data.cameraId);
    if (!camera) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
    await this.cameraService.emitEvent(Events.CAMERA_DELETE, {
      cameraId: camera.id,
    });
    return {
      camera: {
        id: camera.id,
        name: camera.name,
        locationId: camera.locationId,
        cameraSettings: camera.cameraSettings
          ? {
              id: camera.cameraSettings.id,
              aiStatus: camera.cameraSettings.aiStatus,
              recordingStatus: camera.cameraSettings.recordingStatus,
            }
          : undefined,
      },
    };
  }
}

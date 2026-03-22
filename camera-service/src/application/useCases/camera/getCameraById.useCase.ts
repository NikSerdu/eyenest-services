import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import {
  GetCameraByIdRequest,
  GetCameraByIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcStatus } from '@eyenest/common';

@Injectable()
export class GetCameraByIdUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: GetCameraByIdRequest): Promise<GetCameraByIdResponse> {
    const camera = await this.cameraRepository.getCameraById(data.cameraId);
    if (!camera) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
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

import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { Events, RpcStatus } from '@eyenest/common';
import {
  DeleteLocationRequest,
  DeleteLocationResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: DeleteLocationRequest): Promise<DeleteLocationResponse> {
    const currLocation = await this.cameraRepository.getLocationById(
      data.locationId,
    );
    if (currLocation && currLocation.userId !== data.userId) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Вы не являетесь владельцем этой локации!',
      });
    }
    const location = await this.cameraRepository.deleteLocation(
      data.locationId,
    );
    if (!location) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Локация не найдена!',
      });
    }

    location.cameras.forEach(async (camera) => {
      await this.cameraService.emitEvent(Events.CAMERA_DELETE, {
        cameraId: camera.id,
      });
    });

    return {
      location: {
        id: location.id,
        name: location.name,
        userId: location.userId,
        cameras: location.cameras.map((camera) => ({
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
        })),
      },
    };
  }
}

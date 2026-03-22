import { ICameraRepository, Status } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { Events, RpcStatus } from '@eyenest/common';
import {
  UpdateCameraSettingsRequest,
  UpdateCameraSettingsResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UpdateCameraSettingsUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
    private readonly redis: RedisService,
  ) {}

  async execute(
    data: UpdateCameraSettingsRequest,
  ): Promise<UpdateCameraSettingsResponse> {
    const { cameraId, aiStatus, recordingStatus } = data;
    const isCameraOnline = await this.cameraService.checkCameraOnline(cameraId);
    const camera = await this.cameraRepository.getCameraById(cameraId);
    if (!camera) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
    const currentSettings = camera.cameraSettings;
    if (currentSettings?.aiStatus === Status.ON && aiStatus === Status.OFF) {
      await this.cameraService.emitEvent(Events.MOTION_OFF, { cameraId });
    }
    if (currentSettings?.aiStatus === Status.OFF && aiStatus === Status.ON) {
      await this.cameraService.emitEvent(Events.MOTION_ON, { cameraId });
    }
    if (
      currentSettings?.recordingStatus === Status.ON &&
      recordingStatus === Status.OFF
    ) {
      await this.cameraService.emitEvent(Events.CAMERA_STOP_RECORDING, {
        cameraId,
      });
    }
    if (
      currentSettings?.recordingStatus === Status.OFF &&
      recordingStatus === Status.ON
    ) {
      await this.cameraService.emitEvent(Events.CAMERA_START_RECORDING, {
        cameraId,
      });
    }

    const cameraSettings = await this.cameraRepository.updateCameraSettings(
      cameraId,
      {
        aiStatus: Status[aiStatus],
        recordingStatus: Status[recordingStatus],
      },
    );

    return {
      cameraSettings,
    };
  }
}

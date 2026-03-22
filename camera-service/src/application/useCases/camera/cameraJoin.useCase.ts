import { ICameraRepository, Status } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { EventPayload, Events } from '@eyenest/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CameraJoinUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: EventPayload<Events.CAMERA_JOIN>): Promise<void> {
    const { cameraId } = data;
    await this.cameraService.setCameraOnline(cameraId);
    const camera = await this.cameraRepository.getCameraById(cameraId);
    if (!camera) {
      return;
    }
    if (camera.cameraSettings?.recordingStatus === Status.ON) {
      await this.cameraService.emitEvent(Events.CAMERA_START_RECORDING, {
        cameraId,
      });
    }
    if (camera.cameraSettings?.aiStatus === Status.ON) {
      await this.cameraService.emitEvent(Events.MOTION_ON, { cameraId });
    }
  }
}

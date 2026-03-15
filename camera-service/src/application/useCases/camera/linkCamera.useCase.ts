import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import {
  LinkCameraRequest,
  LinkCameraResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkCameraUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: LinkCameraRequest): Promise<LinkCameraResponse> {
    const cameraData = await this.cameraService.findCameraByToken(data.token);
    const camera = await this.cameraRepository.getCameraByNameAndLocation({
      cameraName: cameraData.name,
      locationId: cameraData.locationId,
    });
    if (!camera) {
      const camera = await this.cameraRepository.addCamera(cameraData);
      return await this.cameraService.getCameraTokens(camera.id);
    }
    return await this.cameraService.getCameraTokens(camera.id);
  }
}

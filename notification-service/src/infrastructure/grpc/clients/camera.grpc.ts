import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  CameraServiceClient,
  GetCameraByIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CameraClientGrpc {
  private cameraService: CameraServiceClient | null = null;

  constructor(@Inject('CAMERA_PACKAGE') private readonly client: ClientGrpc) {}

  private get service(): CameraServiceClient {
    if (!this.cameraService) {
      this.cameraService =
        this.client.getService<CameraServiceClient>('CameraService');
    }

    return this.cameraService;
  }

  async getUserIdByCameraId(cameraId: string): Promise<string> {
    const response = await firstValueFrom(
      this.service.getCameraUserIdByCameraId({ cameraId }),
    );
    return response.userId;
  }

  async getCameraByCameraId(cameraId: string): Promise<GetCameraByIdResponse> {
    const response = await firstValueFrom(
      this.service.getCameraById({ cameraId }),
    );
    return response;
  }
}

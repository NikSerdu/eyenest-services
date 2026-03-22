import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  CameraServiceClient,
  GetCameraUserIdByCameraIdRequest,
} from '@eyenest/contracts/gen/ts/camera';

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

  getCameraUserIdByCameraId(data: GetCameraUserIdByCameraIdRequest) {
    return this.service.getCameraUserIdByCameraId(data);
  }
}

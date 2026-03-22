import { ICameraService } from '@/domain/services';
import { CameraClientGrpc } from '../grpc/clients/camera.grpc';
import {
  GetCameraUserIdByCameraIdRequest,
  GetCameraUserIdByCameraIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CameraService implements ICameraService {
  constructor(private readonly cameraClientGrpc: CameraClientGrpc) {}
  async getUserIdByCameraId(
    data: GetCameraUserIdByCameraIdRequest,
  ): Promise<GetCameraUserIdByCameraIdResponse> {
    return await lastValueFrom(
      this.cameraClientGrpc.getCameraUserIdByCameraId(data),
    );
  }
}

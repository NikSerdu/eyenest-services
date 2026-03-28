import { ICameraService } from '@/domain/services/camera.service';
import { Injectable } from '@nestjs/common';
import { CameraClientGrpc } from '../grpc/clients/camera.grpc';
import { GetCameraByIdResponse } from '@eyenest/contracts/gen/ts/camera';

@Injectable()
export class CameraService implements ICameraService {
  constructor(private readonly cameraClientGrpc: CameraClientGrpc) {}

  async getCameraUserIdByCameraId(cameraId: string): Promise<string> {
    return await this.cameraClientGrpc.getUserIdByCameraId(cameraId);
  }

  async getCameraByCameraId(cameraId: string): Promise<GetCameraByIdResponse> {
    return await this.cameraClientGrpc.getCameraByCameraId(cameraId);
  }
}

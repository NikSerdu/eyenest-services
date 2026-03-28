import { GetCameraByIdResponse } from '@eyenest/contracts/gen/ts/camera';

export abstract class ICameraService {
  abstract getCameraUserIdByCameraId(cameraId: string): Promise<string>;
  abstract getCameraByCameraId(
    cameraId: string,
  ): Promise<GetCameraByIdResponse>;
}

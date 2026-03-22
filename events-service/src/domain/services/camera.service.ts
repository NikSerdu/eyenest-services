import {
  GetCameraUserIdByCameraIdRequest,
  GetCameraUserIdByCameraIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
export abstract class ICameraService {
  abstract getUserIdByCameraId(
    data: GetCameraUserIdByCameraIdRequest,
  ): Promise<GetCameraUserIdByCameraIdResponse>;
}

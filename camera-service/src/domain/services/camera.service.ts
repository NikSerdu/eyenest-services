import { ITokenVerify } from '@/shared/types/jwt.interface';
import {
  AddCameraRequest,
  AddCameraResponse,
  LinkCameraResponse,
} from '@eyenest/contracts/gen/ts/camera';

export abstract class ICameraService {
  abstract getCameraTempToken(
    data: Omit<AddCameraRequest, 'userId'>,
  ): Promise<AddCameraResponse>;
  abstract getCameraTokens(cameraId: string): Promise<LinkCameraResponse>;
  abstract verifyToken(refreshToken: string): Promise<ITokenVerify>;
  abstract findCameraByToken(
    token: string,
  ): Promise<Omit<AddCameraRequest, 'userId'>>;
}

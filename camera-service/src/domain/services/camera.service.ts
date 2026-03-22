import { ITokenVerify } from '@/shared/types/jwt.interface';
import { EventPayload, RmqEventMap } from '@eyenest/common';
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
  abstract checkCameraOnline(cameraId: string): Promise<boolean>;
  abstract setCameraOnline(cameraId: string): Promise<void>;
  abstract setCameraOffline(cameraId: string): Promise<void>;
  abstract verifyToken(refreshToken: string): Promise<ITokenVerify>;
  abstract findCameraByToken(
    token: string,
  ): Promise<Omit<AddCameraRequest, 'userId'>>;
  abstract emitEvent<T extends keyof RmqEventMap>(
    event: T,
    data: EventPayload<T>,
  ): Promise<void>;
}

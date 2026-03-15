import { Injectable } from '@nestjs/common';
import { CameraEntity, LocationEntity } from '../entities';
import {
  AddCameraRequest,
  CreateLocationRequest,
} from '@eyenest/contracts/gen/ts/camera';
import { GetCameraByNameAndLocation } from '@/shared';

@Injectable()
export abstract class ICameraRepository {
  abstract getLocationsByUserId(userId: string): Promise<LocationEntity[]>;
  abstract getUserIdByCameraId(cameraId: string): Promise<string>;
  abstract createLocation(data: CreateLocationRequest): Promise<LocationEntity>;
  abstract getCameraByNameAndLocation(
    data: GetCameraByNameAndLocation,
  ): Promise<CameraEntity | null>;
  abstract addCamera(
    data: Omit<AddCameraRequest, 'userId'>,
  ): Promise<CameraEntity>;
}

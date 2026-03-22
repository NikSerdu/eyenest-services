import { Injectable } from '@nestjs/common';
import {
  CameraEntity,
  CameraEntityWithLocation,
  CameraSettingsEntity,
  LocationEntity,
} from '../entities';
import {
  AddCameraRequest,
  CreateLocationRequest,
} from '@eyenest/contracts/gen/ts/camera';
import { GetCameraByNameAndLocation } from '@/shared';

@Injectable()
export abstract class ICameraRepository {
  abstract getLocationsByUserId(userId: string): Promise<LocationEntity[]>;
  abstract getUserIdByCameraId(cameraId: string): Promise<string | null>;
  abstract createLocation(data: CreateLocationRequest): Promise<LocationEntity>;
  abstract deleteLocation(locationId: string): Promise<LocationEntity | null>;
  abstract deleteCamera(cameraId: string): Promise<CameraEntity | null>;
  abstract getCameraByNameAndLocation(
    data: GetCameraByNameAndLocation,
  ): Promise<CameraEntity | null>;
  abstract addCamera(
    data: Omit<AddCameraRequest, 'userId'>,
  ): Promise<CameraEntity>;
  abstract getLocationById(id: string): Promise<LocationEntity | null>;
  abstract getCameraWithLocationById(
    id: string,
  ): Promise<CameraEntityWithLocation | null>;
  abstract updateCameraSettings(
    cameraId: string,
    data: Omit<CameraSettingsEntity, 'id' | 'cameraId'>,
  ): Promise<CameraSettingsEntity>;
  abstract getCameraById(id: string): Promise<CameraEntity | null>;
}

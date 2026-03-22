import {
  CameraEntity,
  CameraEntityWithLocation,
  CameraSettingsEntity,
  ICameraRepository,
  LocationEntity,
} from '@/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetCameraByNameAndLocation, LocationWithCameras } from '@/shared';
import {
  AddCameraRequest,
  CreateLocationRequest,
} from '@eyenest/contracts/gen/ts/camera';

@Injectable()
export class CameraRepository implements ICameraRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getUserIdByCameraId(cameraId: string): Promise<string | null> {
    const camera = await this.prisma.camera.findUnique({
      where: {
        id: cameraId,
      },
      select: {
        location: {
          select: {
            userId: true,
          },
        },
      },
    });
    return camera?.location?.userId ?? null;
  }
  async getLocationsByUserId(userId: string): Promise<LocationWithCameras[]> {
    return await this.prisma.location.findMany({
      where: {
        userId,
      },
      include: {
        cameras: {
          include: {
            cameraSettings: true,
          },
        },
      },
    });
  }
  async createLocation(data: CreateLocationRequest): Promise<LocationEntity> {
    const location = await this.prisma.location.create({
      data,
    });

    return {
      id: location.id,
      name: location.name,
      userId: location.userId,
      cameras: [],
    };
  }

  async addCamera(
    data: Omit<AddCameraRequest, 'userId'>,
  ): Promise<CameraEntity> {
    return await this.prisma.camera.create({
      data: {
        name: data.name,
        location: {
          connect: { id: data.locationId },
        },
        cameraSettings: {
          create: {
            aiStatus: 'OFF',
            recordingStatus: 'OFF',
          },
        },
      },
      include: {
        cameraSettings: true,
      },
    });
  }
  async getCameraByNameAndLocation(
    data: GetCameraByNameAndLocation,
  ): Promise<CameraEntity | null> {
    return await this.prisma.camera.findUnique({
      where: {
        name: data.cameraName,
        locationId: data.locationId,
      },
      include: {
        cameraSettings: true,
      },
    });
  }
  async getLocationById(id: string): Promise<LocationEntity | null> {
    return await this.prisma.location.findUnique({
      where: { id },
      include: {
        cameras: {
          include: {
            cameraSettings: true,
          },
        },
      },
    });
  }
  async getCameraWithLocationById(
    id: string,
  ): Promise<CameraEntityWithLocation | null> {
    return await this.prisma.camera.findUnique({
      where: { id },
      include: {
        cameraSettings: true,
        location: true,
      },
    });
  }
  async getCameraById(id: string): Promise<CameraEntity | null> {
    return await this.prisma.camera.findUnique({
      where: { id },
      include: {
        cameraSettings: true,
      },
    });
  }
  async updateCameraSettings(
    cameraId: string,
    data: Omit<CameraSettingsEntity, 'id'>,
  ): Promise<CameraSettingsEntity> {
    return await this.prisma.cameraSettings.update({
      where: { cameraId: cameraId },
      data,
    });
  }
}

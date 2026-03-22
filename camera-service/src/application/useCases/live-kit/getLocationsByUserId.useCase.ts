import { ICameraRepository } from '@/domain';
import { AuthClientGrpc } from '@/presentation/camera/auth.grpc';
import { RpcStatus } from '@eyenest/common';
import {
  GetLocationsByUserIdRequest,
  GetLocationsByUserIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GetLocationsByUserIdUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly auth: AuthClientGrpc,
  ) {}

  async execute(
    data: GetLocationsByUserIdRequest,
  ): Promise<GetLocationsByUserIdResponse> {
    const isUserExists = await lastValueFrom(this.auth.getById(data));

    if (!isUserExists) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Пользователь не найден!',
      });
    }
    const locations = await this.cameraRepository.getLocationsByUserId(
      data.userId,
    );

    return {
      locations: locations.map((location) => ({
        id: location.id,
        name: location.name,
        userId: location.userId,
        cameras: location.cameras.map((camera) => ({
          id: camera.id,
          name: camera.name,
          locationId: camera.locationId,
          cameraSettings: camera.cameraSettings
            ? {
                id: camera.cameraSettings.id,
                aiStatus: camera.cameraSettings.aiStatus,
                recordingStatus: camera.cameraSettings.recordingStatus,
              }
            : undefined,
        })),
      })),
    };
  }
}

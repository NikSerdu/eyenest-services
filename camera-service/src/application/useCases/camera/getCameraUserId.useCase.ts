import { ICameraRepository } from '@/domain';
import { RpcStatus } from '@eyenest/common';
import {
  GetCameraUserIdByCameraIdRequest,
  GetCameraUserIdByCameraIdResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GetCameraUserIdUseCase {
  constructor(private readonly cameraRepository: ICameraRepository) {}

  async execute(
    data: GetCameraUserIdByCameraIdRequest,
  ): Promise<GetCameraUserIdByCameraIdResponse> {
    const userId = await this.cameraRepository.getUserIdByCameraId(
      data.cameraId,
    );
    if (!userId) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
    return {
      userId,
    };
  }
}

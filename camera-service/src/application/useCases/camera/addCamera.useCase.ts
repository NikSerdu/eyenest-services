import { ICameraRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { RpcStatus } from '@eyenest/common';
import {
  AddCameraRequest,
  AddCameraResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AddCameraUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: AddCameraRequest): Promise<AddCameraResponse> {
    const isExists = await this.cameraRepository.getCameraByNameAndLocation({
      cameraName: data.name,
      locationId: data.locationId,
    });
    if (isExists) {
      throw new RpcException({
        code: RpcStatus.ALREADY_EXISTS,
        details: 'Камера с таким названием в данной локации уже существует!',
      });
    }

    const location = await this.cameraRepository.getLocationById(
      data.locationId,
    );
    if (!location) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Локация не найдена!',
      });
    }

    return await this.cameraService.getCameraTempToken(data);
  }
}

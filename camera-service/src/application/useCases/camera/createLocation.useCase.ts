import { ICameraRepository, LocationEntity } from '@/domain';
import { RpcStatus } from '@eyenest/common';
import { CreateLocationRequest } from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CreateLocationUseCase {
  constructor(private readonly cameraRepository: ICameraRepository) {}

  async execute(data: CreateLocationRequest): Promise<LocationEntity> {
    const locations = await this.cameraRepository.getLocationsByUserId(
      data.userId,
    );
    const isLocationExists = locations.some(
      (location) => location.name === data.name,
    );

    if (isLocationExists) {
      throw new RpcException({
        code: RpcStatus.ALREADY_EXISTS,
        details: 'Локация с таким названием уже существует!',
      });
    }
    return await this.cameraRepository.createLocation(data);
  }
}

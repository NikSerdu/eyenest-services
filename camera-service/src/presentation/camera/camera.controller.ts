import { GetLocationsByUserIdUseCase } from '@/application/useCases/getLocationsByUserId.useCase';
import type {
  AddCameraRequest,
  CreateLocationRequest,
  GetLocationsByUserIdRequest,
  LinkCameraRequest,
} from '@eyenest/contracts/gen/ts/camera';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateLocationUseCase } from '@/application/useCases/createLocation.useCase';
import { AddCameraUseCase } from '@/application/useCases/addCamera.useCase';
import { LinkCameraUseCase } from '@/application/useCases/linkCamera.useCase';

@Controller('camera')
export class CameraController {
  constructor(
    private readonly getLocationsByUserId: GetLocationsByUserIdUseCase,
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly addCameraUseCase: AddCameraUseCase,
    private readonly linkCameraUseCase: LinkCameraUseCase,
  ) {}

  @GrpcMethod('CameraService', 'GetLocationsByUserId')
  async getUserLocations(data: GetLocationsByUserIdRequest) {
    return await this.getLocationsByUserId.execute(data);
  }

  @GrpcMethod('CameraService', 'CreateLocation')
  async createLocation(data: CreateLocationRequest) {
    return await this.createLocationUseCase.execute(data);
  }

  @GrpcMethod('CameraService', 'AddCamera')
  async addCamera(data: AddCameraRequest) {
    return await this.addCameraUseCase.execute(data);
  }

  @GrpcMethod('CameraService', 'LinkCamera')
  async linkCamera(data: LinkCameraRequest) {
    return await this.linkCameraUseCase.execute(data);
  }
}

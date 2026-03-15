import { GetLocationsByUserIdUseCase } from '@/application/useCases/live-kit/getLocationsByUserId.useCase';
import type {
  AddCameraRequest,
  CreateLocationRequest,
  GetLinkCameraTokenRequest,
  GetLocationsByUserIdRequest,
  GetCameraUserIdByCameraIdRequest,
  LinkCameraRequest,
  RefreshRequest,
} from '@eyenest/contracts/gen/ts/camera';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateLocationUseCase } from '@/application/useCases/camera/createLocation.useCase';
import { AddCameraUseCase } from '@/application/useCases/camera/addCamera.useCase';
import { LinkCameraUseCase } from '@/application/useCases/camera/linkCamera.useCase';
import { RefreshUseCase } from '@/application/useCases/camera/refresh.useCase';
import { GetLinkCameraTokenUseCase } from '@/application/useCases/camera/getLinkCameraToken.useCase';
import { GetCameraUserIdUseCase } from '@/application/useCases/camera/getCameraUserId.useCase';

@Controller('camera')
export class CameraController {
  constructor(
    private readonly getLocationsByUserId: GetLocationsByUserIdUseCase,
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly addCameraUseCase: AddCameraUseCase,
    private readonly linkCameraUseCase: LinkCameraUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly getLinkCameraTokenUseCase: GetLinkCameraTokenUseCase,
    private readonly getCameraUserIdUseCase: GetCameraUserIdUseCase,
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

  @GrpcMethod('CameraService', 'Refresh')
  async refresh(data: RefreshRequest) {
    return await this.refreshUseCase.execute(data);
  }

  @GrpcMethod('CameraService', 'GetLinkCameraToken')
  async getLinkCameraToken(data: GetLinkCameraTokenRequest) {
    return await this.getLinkCameraTokenUseCase.execute(data);
  }

  @GrpcMethod('CameraService', 'GetCameraUserIdByCameraId')
  async getCameraUserIdByCameraId(data: GetCameraUserIdByCameraIdRequest) {
    return await this.getCameraUserIdUseCase.execute(data);
  }
}

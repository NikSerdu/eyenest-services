import type {
  GetLiveKitCameraTokenRequest,
  GetLiveKitCameraTokenResponse,
  GetLiveKitViewerTokenRequest,
  GetLiveKitViewerTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetLiveKitViewerTokenUseCase } from '@/application/useCases/getLiveKitViewerToken.useCase';
import { GetLiveKitCameraTokenUseCase } from '@/application/useCases/getLiveKitCameraToken.useCase';
@Controller('camera')
export class VideoController {
  constructor(
    private readonly getLiveKitViewerTokenUseCase: GetLiveKitViewerTokenUseCase,
    private readonly getLiveKitCameraTokenUseCase: GetLiveKitCameraTokenUseCase,
  ) {}

  @GrpcMethod('CameraService', 'GetLiveKitViewerToken')
  async getLiveKitViewerToken(
    data: GetLiveKitViewerTokenRequest,
  ): Promise<GetLiveKitViewerTokenResponse> {
    return await this.getLiveKitViewerTokenUseCase.execute(data);
  }

  @GrpcMethod('CameraService', 'GetLiveKitCameraToken')
  async getLiveKitCameraToken(
    data: GetLiveKitCameraTokenRequest,
  ): Promise<GetLiveKitCameraTokenResponse> {
    return await this.getLiveKitCameraTokenUseCase.execute(data);
  }
}

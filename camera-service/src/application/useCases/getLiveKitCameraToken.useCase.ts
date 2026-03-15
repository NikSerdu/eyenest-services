import { ICameraRepository } from '@/domain';
import { IVideoService } from '@/domain/services/video.service';
import { RpcStatus } from '@eyenest/common';
import {
  GetLiveKitCameraTokenRequest,
  GetLiveKitCameraTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GetLiveKitCameraTokenUseCase {
  constructor(
    private readonly cameraRepository: ICameraRepository,
    private readonly videoService: IVideoService,
  ) {}

  async execute(
    data: GetLiveKitCameraTokenRequest,
  ): Promise<GetLiveKitCameraTokenResponse> {
    if (data.cameraId !== data.roomId) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Вы не имеете доступа к этой комнате!',
      });
    }
    return await this.videoService.getLiveKitCameraToken(data);
  }
}

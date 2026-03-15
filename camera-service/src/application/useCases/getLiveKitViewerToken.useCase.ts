import { ICameraRepository } from '@/domain';
import { IVideoService } from '@/domain/services/video.service';
import { RpcStatus } from '@eyenest/common';
import {
  GetLiveKitViewerTokenRequest,
  GetLiveKitViewerTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class GetLiveKitViewerTokenUseCase {
  constructor(
    private readonly videoService: IVideoService,
    private readonly cameraRepository: ICameraRepository,
  ) {}

  async execute(
    data: GetLiveKitViewerTokenRequest,
  ): Promise<GetLiveKitViewerTokenResponse> {
    const userId = await this.cameraRepository.getUserIdByCameraId(data.roomId);
    if (data.userId !== userId) {
      throw new RpcException({
        code: RpcStatus.UNAUTHENTICATED,
        details: 'Вы не имеете доступа к этой камере!',
      });
    }
    return await this.videoService.getLiveKitViewerToken(data);
  }
}

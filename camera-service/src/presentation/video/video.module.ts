import { ICameraRepository } from '@/domain';
import { CameraRepository } from '@/infrastructure/repositories/camera.repository';
import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { IVideoService } from '@/domain/services/video.service';
import { VideoService } from '@/infrastructure/services/video.service';
import { GetLiveKitViewerTokenUseCase } from '@/application/useCases/getLiveKitViewerToken.useCase';
import { GetLiveKitCameraTokenUseCase } from '@/application/useCases/getLiveKitCameraToken.useCase';
@Module({
  imports: [],
  controllers: [VideoController],
  providers: [
    {
      provide: ICameraRepository,
      useClass: CameraRepository,
    },
    {
      provide: IVideoService,
      useClass: VideoService,
    },
    {
      provide: ICameraRepository,
      useClass: CameraRepository,
    },
    GetLiveKitViewerTokenUseCase,
    GetLiveKitCameraTokenUseCase,
  ],
})
export class VideoModule {}

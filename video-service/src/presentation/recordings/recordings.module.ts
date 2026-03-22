import { IEgressRepository } from '@/domain';
import { EgressRepository } from '@/infrastructure/repositories/egress.repository';
import { Module } from '@nestjs/common';
import { RecordingsController } from './recordings.controller';
import { StartRecordingUseCase } from '@/application/useCases/egress/startRecording.useCase';
import { ICameraService, IVideoService } from '@/domain/services';
import { VideoService } from '@/infrastructure/services/video.service';
import { StopRecordingUseCase } from '@/application/useCases/egress/stopRecording.useCase';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { VideoRepository } from '@/infrastructure/repositories/video.repository';
import { GetAllRecordingUseCase } from '@/application/useCases/video/getAllRecordings.useCase';
import { GetPresignedUrlUseCase } from '@/application/useCases/video/getPresignedUrl.useCase';
import { S3Service } from '@/infrastructure/services/s3.service';
import { IS3Service } from '@/domain/services/s3.service';
import { CameraService } from '@/infrastructure/services/camera.service';
import { DeleteRecordingUseCase } from '@/application/useCases/video/deleteRecording.useCase';
import { DeleteRecordingsByCameraIdUseCase } from '@/application/useCases/video/deleteRecordingsByCameraId.useCase';

@Module({
  imports: [],
  controllers: [RecordingsController],
  providers: [
    {
      provide: IEgressRepository,
      useClass: EgressRepository,
    },
    {
      provide: IVideoRepository,
      useClass: VideoRepository,
    },
    {
      provide: IVideoService,
      useClass: VideoService,
    },

    {
      provide: IS3Service,
      useClass: S3Service,
    },

    {
      provide: ICameraService,
      useClass: CameraService,
    },

    StartRecordingUseCase,
    StopRecordingUseCase,
    GetAllRecordingUseCase,
    GetPresignedUrlUseCase,
    DeleteRecordingUseCase,
    DeleteRecordingsByCameraIdUseCase,
  ],
})
export class RecordingsModule {}

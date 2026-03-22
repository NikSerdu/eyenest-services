import { Injectable } from '@nestjs/common';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';
import { IEgressRepository } from '@/domain';
import { IVideoService } from '@/domain/services';
import { IS3Service } from '@/domain/services/s3.service';
@Injectable()
export class DeleteRecordingsByCameraIdUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly egressRepository: IEgressRepository,
    private readonly videoService: IVideoService,
    private readonly s3Service: IS3Service,
  ) {}

  async execute(cameraId: string): Promise<BatchPayload> {
    const egress = await this.egressRepository.getEgress(cameraId);
    if (egress) {
      await this.egressRepository.deleteEgress(cameraId);
      await this.videoService.stopRecording(egress.egressId);
    }
    await this.s3Service.deleteFolder(cameraId);

    return await this.videoRepository.deleteVideoFilesByCameraId(cameraId);
  }
}

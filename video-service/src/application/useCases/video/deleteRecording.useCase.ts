import type {
  DeleteRecordingRequest,
  DeleteRecordingResponse,
} from '@eyenest/contracts/gen/ts/video';
import { Injectable } from '@nestjs/common';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { VideoFileStatus as PrismaVideoFileStatus } from '@prisma/generated/enums';
import { RpcException } from '@nestjs/microservices';
import { RpcStatus } from '@eyenest/common';
import { IS3Service } from '@/domain/services/s3.service';
import { IEgressRepository } from '@/domain';
import { IVideoService } from '@/domain/services';
@Injectable()
export class DeleteRecordingUseCase {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly s3Service: IS3Service,
    private readonly egressRepository: IEgressRepository,
    private readonly videoService: IVideoService,
  ) {}

  async execute(
    data: DeleteRecordingRequest,
  ): Promise<DeleteRecordingResponse> {
    const recs = await this.videoRepository.deleteVideoFile(data.recordingId);
    if (!recs) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Запись не найдена!',
      });
    }
    const egress = await this.egressRepository.getEgress(recs.cameraId);
    if (egress) {
      await this.egressRepository.deleteEgress(recs.cameraId);
      await this.videoService.stopRecording(egress.egressId);
    }
    const key = recs.playlistName.split('/').slice(0, -1).join('/');
    await this.s3Service.deleteFolder(key);
    return {
      recording: {
        id: recs.id,
        playlistName: recs.playlistName,
        status: recs.status === PrismaVideoFileStatus.RECORDING ? 0 : 1,
        createdAt: recs.createdAt.toISOString(),
        updatedAt: recs.updatedAt.toISOString(),
        finishedAt: recs.finishedAt?.toISOString() ?? '',
      },
    };
  }
}

import { IEgressRepository } from '@/domain';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { IVideoService } from '@/domain/services';
import type {
  StartRecordingRequest,
  StartRecordingResponse,
} from '@eyenest/contracts/gen/ts/video';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { RpcStatus } from '@eyenest/common';
import { VideoFileStatus } from '@prisma/generated/enums';
@Injectable()
export class StartRecordingUseCase {
  constructor(
    private readonly egressRepository: IEgressRepository,
    private readonly videoRepository: IVideoRepository,
    private readonly videoService: IVideoService,
  ) {}

  async execute(data: StartRecordingRequest): Promise<StartRecordingResponse> {
    try {
      const isAlreadyRecording = await this.egressRepository.getEgress(
        data.roomId,
      );
      if (isAlreadyRecording) {
        throw new RpcException({
          code: RpcStatus.ALREADY_EXISTS,
          details: 'Запись уже запущена',
        });
      }
      const egress = await this.videoService.startRecording(data);
      await this.videoRepository.addVideoFile({
        cameraId: data.roomId,
        playlistName: egress.segmentResults[0].playlistName,
        status: VideoFileStatus.RECORDING,
      });
      await this.egressRepository.addEgress({
        roomId: data.roomId,
        egressId: egress.egressId,
      });
      return {
        egressId: egress.egressId,
      };
    } catch (error) {
      throw new RpcException({
        code: RpcStatus.INTERNAL,
        details: 'Ошибка при запуске записи',
      });
    }
  }
}

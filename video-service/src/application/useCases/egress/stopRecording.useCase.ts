import { IEgressRepository } from '@/domain';
import { IVideoService } from '@/domain/services';
import type {
  StopRecordingRequest,
  StopRecordingResponse,
} from '@eyenest/contracts/gen/ts/video';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { RpcStatus } from '@eyenest/common';
import { IVideoRepository } from '@/domain/repositories/video.repository';
@Injectable()
export class StopRecordingUseCase {
  constructor(
    private readonly egressRepository: IEgressRepository,
    private readonly videoRepository: IVideoRepository,
    private readonly videoService: IVideoService,
  ) {}

  async execute(data: StopRecordingRequest): Promise<StopRecordingResponse> {
    try {
      const egress = await this.egressRepository.getEgress(data.roomId);

      if (!egress) {
        throw new RpcException({
          code: RpcStatus.NOT_FOUND,
          details: 'Запись уже закончена',
        });
      }
      const egressInfo = await this.videoService.stopRecording(egress.egressId);
      const file = await this.videoRepository.getRecordingVideo(data.roomId);
      if (!file) {
        throw new RpcException({
          code: RpcStatus.NOT_FOUND,
          details: 'Файл не найден',
        });
      }
      await this.videoRepository.updateStoppedVideo(file.id);
      await this.egressRepository.deleteEgress(egress.roomId);
      return {
        egressId: egressInfo.egressId,
      };
    } catch (error) {
      throw new RpcException({
        code: RpcStatus.INTERNAL,
        details: 'Ошибка при остановке записи',
      });
    }
  }
}

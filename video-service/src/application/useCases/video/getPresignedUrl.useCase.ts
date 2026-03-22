import type {
  GetPresignedUrlRequest,
  GetPresignedUrlResponse,
} from '@eyenest/contracts/gen/ts/video';
import { Injectable } from '@nestjs/common';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { IS3Service } from '@/domain/services/s3.service';
import { RpcStatus } from '@eyenest/common/dist/enums/rpc-status.enum';
import { RpcException } from '@nestjs/microservices';
import { VideoFileStatus } from '@prisma/generated/enums';
@Injectable()
export class GetPresignedUrlUseCase {
  constructor(
    private readonly s3Service: IS3Service,
    private readonly videoRepository: IVideoRepository,
  ) {}

  async execute(
    data: GetPresignedUrlRequest,
  ): Promise<GetPresignedUrlResponse> {
    const file = await this.videoRepository.getVideoFileById(data.fileId);

    if (!file) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Запись не найдена',
      });
    }
    if (file.cameraId !== data.cameraId) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Запись не найдена',
      });
    }
    const fileName =
      file.status === VideoFileStatus.FINISHED
        ? file.playlistName
        : this.getLivePlaylistName(file.playlistName);
    const url = await this.s3Service.getPresignedUrl(fileName);

    return {
      url,
    };
  }

  private getLivePlaylistName(playlistName: string): string {
    return playlistName.replace('.m3u8', '-live.m3u8');
  }
}

import { Injectable } from '@nestjs/common';
import { VideoFileEntity } from '../entities';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';

@Injectable()
export abstract class IVideoRepository {
  abstract addVideoFile(
    data: Omit<
      VideoFileEntity,
      'id' | 'createdAt' | 'updatedAt' | 'finishedAt'
    >,
  ): Promise<VideoFileEntity>;
  abstract updateStoppedVideo(roomId: string): Promise<VideoFileEntity>;
  abstract getVideoFiles(roomId: string): Promise<VideoFileEntity[]>;
  abstract getVideoFileById(id: string): Promise<VideoFileEntity | null>;
  abstract getRecordingVideo(cameraId: string): Promise<VideoFileEntity | null>;
  abstract deleteVideoFile(fileId: string): Promise<VideoFileEntity | null>;
  abstract deleteVideoFilesByCameraId(cameraId: string): Promise<BatchPayload>;
}

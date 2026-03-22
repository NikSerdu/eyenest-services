import { VideoFileEntity } from '@/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IVideoRepository } from '@/domain/repositories/video.repository';
import { VideoFileStatus } from '@prisma/generated/enums';

@Injectable()
export class VideoRepository implements IVideoRepository {
  constructor(private readonly prisma: PrismaService) {}
  async addVideoFile(data: Omit<VideoFileEntity, 'id'>) {
    return await this.prisma.videoFile.create({
      data,
    });
  }
  async getVideoFiles(cameraId: string) {
    return await this.prisma.videoFile.findMany({
      where: {
        cameraId,
      },
    });
  }
  async updateStoppedVideo(fileId: string) {
    return await this.prisma.videoFile.update({
      where: {
        id: fileId,
        status: VideoFileStatus.RECORDING,
      },
      data: {
        status: VideoFileStatus.FINISHED,
        finishedAt: new Date(),
      },
    });
  }
  async getRecordingVideo(cameraId: string) {
    return await this.prisma.videoFile.findFirst({
      where: {
        cameraId,
        status: VideoFileStatus.RECORDING,
      },
    });
  }

  async getVideoFileById(id: string) {
    return await this.prisma.videoFile.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteVideoFile(fileId: string) {
    return await this.prisma.videoFile.delete({
      where: {
        id: fileId,
      },
    });
  }
  async deleteVideoFilesByCameraId(cameraId: string) {
    return await this.prisma.videoFile.deleteMany({
      where: {
        cameraId,
      },
    });
  }
}

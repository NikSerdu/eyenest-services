import { IEventRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { Injectable } from '@nestjs/common';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';

@Injectable()
export class DeleteEventsByCameraIdUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(cameraId: string): Promise<BatchPayload> {
    return await this.eventRepository.deleteEventsByCameraId(cameraId);
  }
}

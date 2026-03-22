import { EventEntity, IEventRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { CreateEventDto } from '@/shared';
import { RpcStatus } from '@eyenest/common';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(data: CreateEventDto): Promise<EventEntity> {
    const userId = await this.cameraService.getUserIdByCameraId({
      cameraId: data.cameraId,
    });
    if (!userId) {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Камера не найдена!',
      });
    }
    const event = await this.eventRepository.createEvent({
      userId: userId.userId,
      cameraId: data.cameraId,
      eventType: data.eventType,
    });
    return event;
  }
}

import { IEventRepository } from '@/domain';
import { ICameraService } from '@/domain/services/camera.service';
import { Injectable } from '@nestjs/common';
import {
  GetEventsByCameraIdRequest,
  GetEventsByCameraIdResponse,
} from '@eyenest/contracts/gen/ts/events';
@Injectable()
export class GetEventsByCameraIdUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cameraService: ICameraService,
  ) {}

  async execute(
    data: GetEventsByCameraIdRequest,
  ): Promise<GetEventsByCameraIdResponse> {
    const events = await this.eventRepository.getEventsByCameraId(
      data.cameraId,
    );
    return {
      events: events.map((event) => ({
        id: event.id,
        cameraId: event.cameraId,
        userId: event.userId,
        eventType: event.eventType,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }
}

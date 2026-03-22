import { Injectable } from '@nestjs/common';
import { EventEntity } from '../entities';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';

@Injectable()
export abstract class IEventRepository {
  abstract createEvent(
    event: Omit<EventEntity, 'id' | 'createdAt'>,
  ): Promise<EventEntity>;
  abstract getEventsByCameraId(cameraId: string): Promise<EventEntity[]>;
  abstract deleteEventsByCameraId(cameraId: string): Promise<BatchPayload>;
}

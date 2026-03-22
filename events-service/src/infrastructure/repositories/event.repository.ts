import { EventEntity, IEventRepository } from '@/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';

@Injectable()
export class EventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(event: EventEntity): Promise<EventEntity> {
    return this.prisma.event.create({
      data: {
        cameraId: event.cameraId,
        userId: event.userId,
        eventType: event.eventType,
      },
    });
  }

  getEventsByCameraId(cameraId: string): Promise<EventEntity[]> {
    return this.prisma.event.findMany({
      where: {
        cameraId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  deleteEventsByCameraId(cameraId: string): Promise<BatchPayload> {
    return this.prisma.event.deleteMany({
      where: {
        cameraId,
      },
    });
  }
}

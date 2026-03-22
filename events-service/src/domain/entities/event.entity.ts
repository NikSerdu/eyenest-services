import type { EventType } from '@prisma/generated/enums'

export { EventType } from '@prisma/generated/enums'

export class EventEntity {
  id: string;
  cameraId: string;
  userId: string;
  eventType: EventType;
  createdAt: Date;
}

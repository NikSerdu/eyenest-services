import { EventType } from '@/domain';

export interface CreateEventDto {
  cameraId: string;
  eventType: EventType;
}

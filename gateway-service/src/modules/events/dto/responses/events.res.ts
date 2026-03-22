import { ApiProperty } from '@nestjs/swagger';

export class EventResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  cameraId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  eventType: string;
  @ApiProperty()
  createdAt: string;
}

import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import { CreateEventUseCase } from '@/application/useCases/event/createEvent.useCase';
import { type EventPayload, Events } from '@eyenest/common';
import { EventType } from '@/domain';
import type { GetEventsByCameraIdRequest } from '@eyenest/contracts/gen/ts/events';
import { GetEventsByCameraIdUseCase } from '@/application/useCases/event/getEventsByUserId.useCase';
import { DeleteEventsByCameraIdUseCase } from '@/application/useCases/event/deleteEventsByCameraId.useCase';

@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventsByCameraIdUseCase: GetEventsByCameraIdUseCase,
    private readonly deleteEventsByCameraIdUseCase: DeleteEventsByCameraIdUseCase,
  ) {}

  @EventPattern(Events.CAMERA_JOIN)
  async cameraJoin(data: EventPayload<Events.CAMERA_JOIN>) {
    console.log('cameraJoin', data);
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.CAMERA_JOIN,
    });
  }

  @EventPattern(Events.CAMERA_LEAVE)
  async cameraLeave(data: EventPayload<Events.CAMERA_LEAVE>) {
    console.log('cameraLeave', data);
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.CAMERA_LEAVE,
    });
  }

  @EventPattern(Events.MOTION_DETECTED)
  async motionDetected(data: EventPayload<Events.MOTION_DETECTED>) {
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.MOTION_DETECTED,
    });
  }

  @EventPattern(Events.MOTION_ON)
  async motionOn(data: EventPayload<Events.MOTION_ON>) {
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.MOTION_ON,
    });
  }

  @EventPattern(Events.MOTION_OFF)
  async motionOff(data: EventPayload<Events.MOTION_OFF>) {
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.MOTION_OFF,
    });
  }
  @EventPattern(Events.CAMERA_START_RECORDING)
  async startRecording(data: EventPayload<Events.CAMERA_START_RECORDING>) {
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.START_RECORDING,
    });
  }
  @EventPattern(Events.CAMERA_STOP_RECORDING)
  async stopRecording(data: EventPayload<Events.CAMERA_STOP_RECORDING>) {
    return await this.createEventUseCase.execute({
      cameraId: data.cameraId,
      eventType: EventType.STOP_RECORDING,
    });
  }

  @EventPattern(Events.CAMERA_DELETE)
  async deleteCamera(data: EventPayload<Events.CAMERA_DELETE>) {
    return await this.deleteEventsByCameraIdUseCase.execute(data.cameraId);
  }

  @GrpcMethod('EventsService', 'GetEventsByCameraId')
  async getEventsByCameraId(data: GetEventsByCameraIdRequest) {
    return await this.getEventsByCameraIdUseCase.execute(data);
  }
}

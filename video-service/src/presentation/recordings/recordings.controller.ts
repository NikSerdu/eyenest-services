import type {
  StartRecordingResponse,
  StopRecordingResponse,
  GetAllRecordingsRequest,
  GetAllRecordingsResponse,
  GetPresignedUrlResponse,
  GetPresignedUrlRequest,
  DeleteRecordingRequest,
  DeleteRecordingResponse,
} from '@eyenest/contracts/gen/ts/video';
import { StartRecordingUseCase } from '@/application/useCases/egress/startRecording.useCase';
import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { StopRecordingUseCase } from '@/application/useCases/egress/stopRecording.useCase';
import { GetAllRecordingUseCase } from '@/application/useCases/video/getAllRecordings.useCase';
import { GetPresignedUrlUseCase } from '@/application/useCases/video/getPresignedUrl.useCase';
import { Events, type EventPayload } from '@eyenest/common';
import { DeleteRecordingUseCase } from '@/application/useCases/video/deleteRecording.useCase';
import { DeleteRecordingsByCameraIdUseCase } from '@/application/useCases/video/deleteRecordingsByCameraId.useCase';
import { BatchPayload } from '@prisma/generated/internal/prismaNamespace';

@Controller('recordings')
export class RecordingsController {
  constructor(
    private readonly startRecordingUseCase: StartRecordingUseCase,
    private readonly stopRecordingUseCase: StopRecordingUseCase,
    private readonly getAllRecordingsUseCase: GetAllRecordingUseCase,
    private readonly getPresignedUrlUseCase: GetPresignedUrlUseCase,
    private readonly deleteRecordingUseCase: DeleteRecordingUseCase,
    private readonly deleteRecordingsByCameraIdUseCase: DeleteRecordingsByCameraIdUseCase,
  ) {}

  @EventPattern(Events.CAMERA_START_RECORDING)
  async startRecording(
    @Payload() data: EventPayload<Events.CAMERA_START_RECORDING>,
  ): Promise<StartRecordingResponse> {
    return await this.startRecordingUseCase.execute({ roomId: data.cameraId });
  }

  @EventPattern(Events.CAMERA_STOP_RECORDING)
  async stopRecording(
    @Payload() data: EventPayload<Events.CAMERA_STOP_RECORDING>,
  ): Promise<StopRecordingResponse> {
    return await this.stopRecordingUseCase.execute({ roomId: data.cameraId });
  }

  @EventPattern(Events.CAMERA_DELETE)
  async deleteRecordingsByCameraId(
    @Payload() data: EventPayload<Events.CAMERA_DELETE>,
  ): Promise<BatchPayload> {
    return await this.deleteRecordingsByCameraIdUseCase.execute(data.cameraId);
  }

  @GrpcMethod('VideoService', 'DeleteRecording')
  async deleteRecording(
    data: DeleteRecordingRequest,
  ): Promise<DeleteRecordingResponse> {
    return await this.deleteRecordingUseCase.execute(data);
  }

  @GrpcMethod('VideoService', 'GetAllRecordings')
  async getAllRecordings(
    data: GetAllRecordingsRequest,
  ): Promise<GetAllRecordingsResponse> {
    return await this.getAllRecordingsUseCase.execute(data);
  }

  @GrpcMethod('VideoService', 'GetPresignedUrl')
  async getPresignedUrl(
    data: GetPresignedUrlRequest,
  ): Promise<GetPresignedUrlResponse> {
    return await this.getPresignedUrlUseCase.execute(data);
  }
}

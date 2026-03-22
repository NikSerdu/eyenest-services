import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { VideoClientGrpc } from './video.grpc';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RecordingResponse } from './dto/responses/cameras.res';
import { CameraOwner, Current } from '@/shared';
import {
  DeleteRecordingRequest,
  GetAllRecordingsQuery,
} from './dto/requests/video.req';
@Controller('video')
export class VideoController {
  constructor(private readonly video: VideoClientGrpc) {}

  @ApiOperation({
    summary: 'Get all recordings',
  })
  @Get('getAllRecordings')
  @CameraOwner()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'cameraId', type: String })
  @CameraOwner()
  @ApiOkResponse({ type: RecordingResponse, isArray: true })
  async getAllRecordings(@Query() query: GetAllRecordingsQuery) {
    const res = await this.video.call('getAllRecordings', {
      roomId: query.cameraId,
    });
    return res.recording && res.recording.length ? res.recording : [];
  }

  @ApiOperation({
    summary: 'Delete recording',
  })
  @ApiOkResponse({ type: RecordingResponse })
  @HttpCode(HttpStatus.OK)
  @CameraOwner()
  @Delete('deleteRecording')
  async deleteRecording(
    @Body() body: DeleteRecordingRequest,
    @Current('user') userId: string,
  ) {
    const res = await this.video.call('deleteRecording', {
      recordingId: body.recordingId,
      userId,
    });
    return res.recording ? res.recording : null;
  }
}

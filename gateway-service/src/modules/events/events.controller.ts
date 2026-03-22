import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { EventResponse } from './dto';
import { ConfigService } from '@nestjs/config';
import { EventsClientGrpc } from '@/core/grpc-clients/events.grpc';
import { CameraOwner } from '@/shared';

@Controller('events')
export class EventsController {
  constructor(
    private readonly events: EventsClientGrpc,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Get events by camera ID',
  })
  @ApiOkResponse({
    type: EventResponse,
    isArray: true,
  })
  @CameraOwner()
  @HttpCode(HttpStatus.OK)
  @Get('getEventsByCameraId')
  async getEventsByCameraId(@Query('cameraId') cameraId: string) {
    const res = await this.events.call('getEventsByCameraId', {
      cameraId,
    });
    return res.events ? res.events : [];
  }
}

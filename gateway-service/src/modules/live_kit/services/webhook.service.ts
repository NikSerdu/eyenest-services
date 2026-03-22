import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackType, WebhookEvent, WebhookReceiver } from 'livekit-server-sdk';
import { Request } from 'express';
import { Events, TypedEventEmitter } from '@eyenest/common';

type RawBodyRequest = Request & {
  rawBody?: Buffer | string;
};

@Injectable()
export class WebhookService {
  private readonly receiver: WebhookReceiver;

  constructor(
    private readonly configService: ConfigService,
    private readonly emitter: TypedEventEmitter,
  ) {
    this.receiver = new WebhookReceiver(
      this.configService.getOrThrow<string>('LIVEKIT_WEBHOOK_KEY'),
      this.configService.getOrThrow<string>('LIVEKIT_API_SECRET'),
    );
  }

  async handleWebhook(req: RawBodyRequest) {
    const event: WebhookEvent = await this.receiver.receive(
      req.body,
      req.get('Authorization'),
    );
    const eventType = event.event;

    if (
      event.participant?.identity === event.room?.name &&
      event.track?.type === TrackType.VIDEO
    ) {
      if (eventType === 'track_published') {
        this.emitter.emit(Events.CAMERA_JOIN, {
          cameraId: event.room?.name ?? '',
        });
      } else if (eventType === 'track_unpublished') {
        this.emitter.emit(Events.CAMERA_LEAVE, {
          cameraId: event.room?.name ?? '',
        });
      }
    }
    return event;
  }
}

import {
  GetLiveKitCameraTokenRequest,
  GetLiveKitCameraTokenResponse,
  GetLiveKitViewerTokenRequest,
  GetLiveKitViewerTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IVideoService } from '@/domain/services/video.service';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class VideoService implements IVideoService {
  constructor(private readonly config: ConfigService) {}
  async getLiveKitViewerToken(
    data: GetLiveKitViewerTokenRequest,
  ): Promise<GetLiveKitViewerTokenResponse> {
    const at = new AccessToken(
      this.config.getOrThrow('LIVEKIT_API_KEY'),
      this.config.getOrThrow('LIVEKIT_API_SECRET'),
      {
        identity: data.userId,
      },
    );
    at.addGrant({
      room: data.roomId,
      roomJoin: true,
      canSubscribe: true,
    });
    const token = await at.toJwt();
    return { token };
  }
  async getLiveKitCameraToken(
    data: GetLiveKitCameraTokenRequest,
  ): Promise<GetLiveKitCameraTokenResponse> {
    const at = new AccessToken(
      this.config.getOrThrow('LIVEKIT_API_KEY'),
      this.config.getOrThrow('LIVEKIT_API_SECRET'),
      {
        identity: data.cameraId,
      },
    );
    at.addGrant({
      room: data.roomId,
      roomJoin: true,
      canPublish: true,
    });
    const token = await at.toJwt();
    return { token };
  }
}

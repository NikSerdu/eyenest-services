import {
  GetLiveKitViewerTokenRequest,
  GetLiveKitViewerTokenResponse,
  GetLiveKitCameraTokenRequest,
  GetLiveKitCameraTokenResponse,
} from '@eyenest/contracts/gen/ts/camera';

export abstract class IVideoService {
  abstract getLiveKitViewerToken(
    data: GetLiveKitViewerTokenRequest,
  ): Promise<GetLiveKitViewerTokenResponse>;
  abstract getLiveKitCameraToken(
    data: GetLiveKitCameraTokenRequest,
  ): Promise<GetLiveKitCameraTokenResponse>;
}

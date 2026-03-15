import { ApiProperty } from '@nestjs/swagger';

export class CameraSettingsResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['ON', 'OFF'] })
  aiStatus: string;
}

export class CameraResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: CameraSettingsResponse, nullable: true })
  cameraSettings: CameraSettingsResponse | null;
}

export class LocationResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [CameraResponse] })
  cameras: CameraResponse[];
}

export class AddCameraResponse {
  @ApiProperty()
  token: string;
}

export class LinkCameraResponse {
  @ApiProperty()
  accessToken: string;
}

export class GetLinkCameraTokenResponse {
  @ApiProperty()
  token: string;
}

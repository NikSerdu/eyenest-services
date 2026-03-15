import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetLiveKitViewerTokenRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class GetLiveKitCameraTokenRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraId: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

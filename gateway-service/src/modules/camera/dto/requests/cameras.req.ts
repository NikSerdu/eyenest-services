import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddCameraRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId: string;
}

export class LinkCameraRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class GetLinkCameraTokenRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export class UpdateCameraSettingsRequest {
  @ApiProperty({ enum: ['ON', 'OFF'] })
  @IsString()
  @IsNotEmpty()
  aiStatus: string;

  @ApiProperty({ enum: ['ON', 'OFF'] })
  @IsString()
  @IsNotEmpty()
  recordingStatus: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export class GetCameraByIdRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export class DeleteCameraRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

export class DeleteLocationRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId: string;
}

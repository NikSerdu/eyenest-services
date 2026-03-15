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

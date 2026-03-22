import { IsString, IsNotEmpty } from 'class-validator';

export class GetEventsByCameraIdRequest {
  @IsString()
  @IsNotEmpty()
  cameraId: string;
}

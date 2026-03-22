import { ApiProperty } from '@nestjs/swagger';

export class RecordingResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  playlistName: string;
  @ApiProperty()
  status: VideoFileStatus;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
  @ApiProperty()
  finishedAt: string;
}

export enum VideoFileStatus {
  RECORDING = 0,
  FINISHED = 1,
  UNRECOGNIZED = -1,
}

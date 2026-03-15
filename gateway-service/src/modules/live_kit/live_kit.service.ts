import { Injectable } from '@nestjs/common';
import {
  EgressClient,
  SegmentedFileOutput,
  EncodingOptionsPreset,
} from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private livekitUrl = process.env.LIVEKIT_URL!;
  private apiKey = process.env.LIVEKIT_API_KEY!;
  private apiSecret = process.env.LIVEKIT_API_SECRET!;

  /** Запуск записи HLS в S3/MinIO */
  async startHlsRecording(roomName: string, cameraId: string) {
    const egressClient = new EgressClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret,
    );

    // Настройка HLS с S3
    const outputs = {
      segments: new SegmentedFileOutput({
        filenamePrefix: cameraId,
        playlistName: 'playlist.m3u8',
        livePlaylistName: 'playlist-live.m3u8',
        segmentDuration: 4, // 4 секунды
        output: {
          case: 's3',
          value: {
            accessKey: 'minioadmin',
            secret: 'minioadmin',
            bucket: 'livekit',
            region: '', // для MinIO можно оставить пустым
            forcePathStyle: true,
            endpoint: 'http://minio:9000', // твой локальный MinIO
          },
        },
      }),
    };

    await egressClient.startRoomCompositeEgress(roomName, outputs, {
      layout: 'speaker',
      encodingOptions: EncodingOptionsPreset.H264_1080P_30,
      audioOnly: false,
    });
  }
}

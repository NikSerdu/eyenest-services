import { Module } from '@nestjs/common';
import { LiveKitService } from './live_kit.service';
import { LiveKitController } from './live_kit.controller';
import { GrpcModule } from '@eyenest/common';
import { CameraClientGrpc } from '@/core/grpc-clients/camera.grpc';

@Module({
  imports: [GrpcModule.register(['CAMERA_PACKAGE'])],
  controllers: [LiveKitController],
  providers: [LiveKitService, CameraClientGrpc],
})
export class LiveKitModule {}

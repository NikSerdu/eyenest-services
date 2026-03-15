import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { GrpcModule } from '@eyenest/common';
import { CameraClientGrpc } from '../../core/grpc-clients/camera.grpc';

@Module({
  imports: [GrpcModule.register(['CAMERA_PACKAGE'])],
  controllers: [CameraController],
  providers: [CameraClientGrpc],
})
export class CameraModule {}

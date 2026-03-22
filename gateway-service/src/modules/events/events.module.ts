import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { GrpcModule } from '@eyenest/common';
import { CameraClientGrpc } from '@/core/grpc-clients/camera.grpc';
import { EventsClientGrpc } from '@/core/grpc-clients/events.grpc';
import { CameraOwnerGuard } from '@/shared/guards/camera-owner.guard';

@Module({
  imports: [
    GrpcModule.register(['EVENTS_PACKAGE']),
    GrpcModule.register(['CAMERA_PACKAGE']),
  ],
  controllers: [EventsController],
  providers: [EventsClientGrpc, CameraClientGrpc, CameraOwnerGuard],
})
export class EventsModule {}

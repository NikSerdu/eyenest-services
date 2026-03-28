import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { GrpcModule } from '@eyenest/common';
import { NotificationsClientGrpc } from '@/core/grpc-clients/notifications.grpc';

@Module({
  imports: [GrpcModule.register(['NOTIFICATIONS_PACKAGE'])],
  controllers: [NotificationsController],
  providers: [NotificationsClientGrpc],
})
export class NotificationsModule {}

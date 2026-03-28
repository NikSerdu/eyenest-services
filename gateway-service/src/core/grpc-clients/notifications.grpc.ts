import { Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpcClient } from '@eyenest/common';
import { AbstractGrpcClient } from '@/shared/grpc/abstract-grpc.client';
import type { NotificationsServiceClient } from '@eyenest/contracts/gen/ts/notifications';

@Injectable()
export class NotificationsClientGrpc extends AbstractGrpcClient<NotificationsServiceClient> {
  constructor(@InjectGrpcClient('NOTIFICATIONS_PACKAGE') client: ClientGrpc) {
    super(client, 'NotificationsService');
  }
}

import { Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpcClient } from '@eyenest/common';
import { AbstractGrpcClient } from '@/shared/grpc/abstract-grpc.client';
import type { EventsServiceClient } from '@eyenest/contracts/gen/ts/events';

@Injectable()
export class EventsClientGrpc extends AbstractGrpcClient<EventsServiceClient> {
  constructor(@InjectGrpcClient('EVENTS_PACKAGE') client: ClientGrpc) {
    super(client, 'EventsService');
  }
}

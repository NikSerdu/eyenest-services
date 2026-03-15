import { Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { InjectGrpcClient } from '@eyenest/common';
import { AbstractGrpcClient } from '@/shared';
import type { CameraServiceClient } from '@eyenest/contracts/gen/ts/camera';
@Injectable()
export class CameraClientGrpc extends AbstractGrpcClient<CameraServiceClient> {
  constructor(@InjectGrpcClient('CAMERA_PACKAGE') client: ClientGrpc) {
    super(client, 'CameraService');
  }
}

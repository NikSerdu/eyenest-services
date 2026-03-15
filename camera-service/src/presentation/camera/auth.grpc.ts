import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  AuthServiceClient,
  GetUserByIdRequest,
} from '@eyenest/contracts/gen/ts/auth';

@Injectable()
export class AuthClientGrpc {
  private authService: AuthServiceClient | null = null;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  private get service(): AuthServiceClient {
    if (!this.authService) {
      this.authService =
        this.client.getService<AuthServiceClient>('AuthService');
    }

    return this.authService;
  }

  getById(data: GetUserByIdRequest) {
    return this.service.getUserById(data);
  }
}

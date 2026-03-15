import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that puts validated payload into request.camera (for camera-scoped tokens).
 * Use with @Auth('camera').
 */
export class JwtCameraAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(
    err: unknown,
    user: TUser,
    _info: unknown,
    ctx: ExecutionContext,
    _status?: unknown,
  ): TUser {
    const result = super.handleRequest(err, user, _info, ctx, _status);
    const request = ctx.switchToHttp().getRequest();
    request.camera = result;
    return result;
  }
}

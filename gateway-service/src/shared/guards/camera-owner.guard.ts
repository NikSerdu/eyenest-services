import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CameraClientGrpc } from '@/core/grpc-clients/camera.grpc';

@Injectable()
export class CameraOwnerGuard implements CanActivate {
  constructor(private readonly cameraClient: CameraClientGrpc) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    const body = request.body ?? {};
    const cameraId: string | undefined =
      body.cameraId || request.query.cameraId;

    if (!cameraId) {
      return true;
    }

    if (!user?.id) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const response = await this.cameraClient.call('getCameraUserIdByCameraId', {
      cameraId,
    });

    if (!response || response.userId !== user.id) {
      throw new ForbiddenException('Вы не являетесь владельцем этой камеры');
    }

    return true;
  }
}

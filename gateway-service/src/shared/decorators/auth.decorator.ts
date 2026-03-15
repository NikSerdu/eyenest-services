import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { JwtCameraAuthGuard } from '../guards/jwt-camera.guard';

export type AuthTarget = 'user' | 'camera';

/**
 * Protects route with JWT. Validated payload is placed in:
 * - request.user when @Auth() or @Auth('user')
 * - request.camera when @Auth('camera')
 */
export const Auth = (target: AuthTarget) => {
  const Guard = target === 'camera' ? JwtCameraAuthGuard : JwtAuthGuard;
  return UseGuards(Guard);
};

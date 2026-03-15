import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthTarget } from './auth.decorator';

/**
 * Reads id from request.user or request.camera depending on target.
 * Use the same target as @Auth(): @Current('user') with @Auth() / @Auth('user'), @Current('camera') with @Auth('camera').
 */
export const Current = createParamDecorator(
  (target: AuthTarget = 'user', ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const payload = target === 'camera' ? request.camera : request.user;
    return payload.id ?? null;
  },
);

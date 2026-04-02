import type { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

export function sessionCookieOptions(
  config: ConfigService,
  maxAgeMs: number,
): CookieOptions {
  const domain = config.get<string>('COOKIES_DOMAIN');
  const secure = config.getOrThrow<string>('NODE_ENV') !== 'development';
  const base: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: maxAgeMs,
  };
  if (domain?.trim()) {
    return { ...base, domain };
  }
  return base;
}

export function clearSessionCookieOptions(config: ConfigService): CookieOptions {
  const domain = config.get<string>('COOKIES_DOMAIN');
  const path = '/';
  if (domain?.trim()) {
    return { domain, path };
  }
  return { path };
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthClientGrpc } from './auth.grpc';
import { RegisterRequest } from './dto/requests/register.req';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LoginRequest, LoginResponse, RegisterResponse } from './dto';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Auth, Current } from '@/shared';
import { GetUserResponse } from './dto/responses/getUser.res';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthClientGrpc,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Register user',
  })
  @ApiOkResponse({
    type: RegisterResponse,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.auth.call(
      'register',
      body,
    );
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken,
    };
  }

  @ApiOperation({
    summary: 'Login user',
  })
  @ApiOkResponse({
    type: LoginResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.auth.call('login', body);
    console.log(accessToken, refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Renews access token using refresh token from cookies',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    console.log(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = await this.auth.call(
      'refresh',
      { refreshToken },
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.config.getOrThrow('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Clears the refresh token cookie and logs the user out',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') !== 'development',
      domain: this.config.getOrThrow<string>('COOKIES_DOMAIN'),
      sameSite: 'lax',
      expires: new Date(0),
    });

    return { ok: true };
  }

  @ApiOperation({
    summary: 'Get current user by token',
  })
  @ApiOkResponse({
    type: GetUserResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Get('getUser')
  async getUser(@Current('user') userId: string) {
    console.log(userId);

    return await this.auth.call('getUserById', { userId });
  }
}

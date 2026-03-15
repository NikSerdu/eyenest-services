import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiCookieAuth } from '@nestjs/swagger';
import {
  AddCameraResponse,
  GetLinkCameraTokenResponse,
  LinkCameraResponse,
  LocationResponse,
} from './dto';
import { Auth, Current } from '@/shared';
import {
  AddCameraRequest,
  CreateLocationRequest,
  LinkCameraRequest,
  GetLinkCameraTokenRequest,
} from './dto/requests/cameras.req';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CameraClientGrpc } from '@/core/grpc-clients/camera.grpc';

@Controller('camera')
export class CameraController {
  constructor(
    private readonly camera: CameraClientGrpc,
    private readonly config: ConfigService,
  ) {}

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Get all user cameras grouped by location',
  })
  @ApiOkResponse({
    type: LocationResponse,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Get('locations')
  async getCameras(@Current('user') userId: string) {
    const res = await this.camera.call('getLocationsByUserId', {
      userId,
    });
    return res.locations ? res.locations : [];
  }

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Create location',
  })
  @ApiOkResponse({
    type: LocationResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Post('locations')
  async createLocation(
    @Current('user') userId: string,
    @Body() body: CreateLocationRequest,
  ) {
    return await this.camera.call('createLocation', {
      userId,
      name: body.name,
    });
  }

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Add camera to location',
  })
  @ApiOkResponse({
    type: AddCameraResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Post('addCamera')
  async addCamera(
    @Current('user') userId: string,
    @Body() body: AddCameraRequest,
  ) {
    return await this.camera.call('addCamera', {
      userId,
      ...body,
    });
  }

  @ApiOperation({
    summary: 'Link camera to location',
  })
  @ApiOkResponse({
    type: LinkCameraResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('linkCamera')
  async linkCamera(
    @Body() body: LinkCameraRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.camera.call(
      'linkCamera',
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
    summary: 'Get link camera token',
  })
  @ApiOkResponse({
    type: GetLinkCameraTokenResponse,
  })
  @Auth('user')
  @HttpCode(HttpStatus.OK)
  @Post('getLinkCameraToken')
  async getLinkCameraToken(
    @Body() body: GetLinkCameraTokenRequest,
    @Current('user') userId: string,
  ) {
    return await this.camera.call('getLinkCameraToken', {
      cameraId: body.cameraId,
      userId,
    });
  }
}

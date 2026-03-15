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
import { AddCameraResponse, LinkCameraResponse, LocationResponse } from './dto';
import { Auth, CurrentUser } from '@/shared';
import {
  AddCameraRequest,
  CreateLocationRequest,
  LinkCameraRequest,
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
  @Auth()
  @Get('locations')
  async getCameras(@CurrentUser() userId: string) {
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
  @Auth()
  @Post('locations')
  async createLocation(
    @CurrentUser() userId: string,
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
  @Auth()
  @Post('addCamera')
  async addCamera(
    @CurrentUser() userId: string,
    @Body() body: AddCameraRequest,
  ) {
    return await this.camera.call('addCamera', {
      userId,
      ...body,
    });
  }

  // @ApiCookieAuth('accessToken')
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
}

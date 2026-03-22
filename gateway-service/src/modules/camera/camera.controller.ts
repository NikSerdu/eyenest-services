import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiCookieAuth } from '@nestjs/swagger';
import {
  AddCameraResponse,
  CameraResponse,
  CameraSettingsResponse,
  GetCameraIdByAccessTokenResponse,
  GetLinkCameraTokenResponse,
  LinkCameraResponse,
  LocationResponse,
} from './dto';
import { Auth, CameraOwner, Current } from '@/shared';
import {
  AddCameraRequest,
  CreateLocationRequest,
  LinkCameraRequest,
  GetLinkCameraTokenRequest,
  UpdateCameraSettingsRequest,
  GetCameraByIdRequest,
  DeleteCameraRequest,
  DeleteLocationRequest,
} from './dto/requests/cameras.req';
import type { Request, Response } from 'express';
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
  @CameraOwner()
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

  @ApiOperation({
    summary: 'Refresh access token for camera',
    description: 'Renews access token using refresh token from cookies',
  })
  @ApiOkResponse({
    type: LinkCameraResponse,
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.camera.call('refresh', { refreshToken });

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
    summary: 'Get camera id by access token',
  })
  @ApiOkResponse({
    type: GetCameraIdByAccessTokenResponse,
  })
  @Auth('camera')
  @HttpCode(HttpStatus.OK)
  @Get('getCameraIdByAccessToken')
  async getCameraIdByAccessToken(@Current('camera') cameraId: string) {
    return { cameraId };
  }

  @ApiOperation({
    summary: 'Update camera settings',
  })
  @ApiOkResponse({
    type: CameraSettingsResponse,
  })
  @CameraOwner()
  @HttpCode(HttpStatus.OK)
  @Post('updateCameraSettings')
  async updateCameraSettings(@Body() body: UpdateCameraSettingsRequest) {
    const res = await this.camera.call('updateCameraSettings', body);
    return res.cameraSettings ? res.cameraSettings : null;
  }

  @ApiOperation({
    summary: 'Get camera by id',
  })
  @ApiOkResponse({
    type: CameraResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Get('getCameraById')
  async getCameraById(@Query() query: GetCameraByIdRequest) {
    const camera = await this.camera.call('getCameraById', query);
    return camera.camera ? camera.camera : null;
  }

  @ApiOperation({
    summary: 'Delete camera',
  })
  @ApiOkResponse({
    type: CameraResponse,
  })
  @HttpCode(HttpStatus.OK)
  @CameraOwner()
  @Delete('deleteCamera')
  async deleteCamera(@Body() body: DeleteCameraRequest) {
    const res = await this.camera.call('deleteCamera', body);
    return res.camera ? res.camera : null;
  }

  @ApiOperation({
    summary: 'Delete location',
  })
  @ApiOkResponse({
    type: LocationResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Delete('deleteLocation')
  async deleteLocation(
    @Body() body: DeleteLocationRequest,
    @Current('user') userId: string,
  ) {
    const res = await this.camera.call('deleteLocation', {
      locationId: body.locationId,
      userId,
    });
    return res.location ? res.location : null;
  }
}

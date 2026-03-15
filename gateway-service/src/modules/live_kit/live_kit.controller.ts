import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  GetLiveKitCameraTokenResponse,
  GetLiveKitViewerTokenResponse as GetLiveKitViewerTokenResponseDto,
} from './dto/responses/cameras.res';
import { Auth, Current } from '@/shared';
import { GetLiveKitViewerTokenResponse } from '@eyenest/contracts/gen/ts/camera';
import { CameraClientGrpc } from '@/core/grpc-clients/camera.grpc';
@Controller('live_kit')
export class LiveKitController {
  constructor(private readonly camera: CameraClientGrpc) {}

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Get live kit viewer token',
  })
  @ApiOkResponse({
    type: GetLiveKitViewerTokenResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'roomId',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('user')
  @Get('getLiveKitViewerToken')
  async getLiveKitViewerToken(
    @Current('user') userId: string,
    @Query('roomId') roomId: string,
  ): Promise<GetLiveKitViewerTokenResponse> {
    return await this.camera.call('getLiveKitViewerToken', {
      userId,
      roomId,
    });
  }

  @ApiCookieAuth('accessToken')
  @ApiOperation({
    summary: 'Get live kit viewer token',
  })
  @ApiOkResponse({
    type: GetLiveKitViewerTokenResponseDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'roomId',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Auth('camera')
  @Get('getLiveKitCameraToken')
  async getLiveKitCameraToken(
    @Current('camera') cameraId: string,
    @Query('roomId') roomId: string,
  ): Promise<GetLiveKitCameraTokenResponse> {
    console.log(cameraId, roomId);
    return await this.camera.call('getLiveKitCameraToken', {
      cameraId,
      roomId,
    });
  }
}

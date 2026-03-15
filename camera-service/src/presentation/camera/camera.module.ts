import { GetLocationsByUserIdUseCase } from '@/application/useCases/live-kit/getLocationsByUserId.useCase';
import { ICameraRepository } from '@/domain';
import { CameraRepository } from '@/infrastructure/repositories/camera.repository';
import { Module } from '@nestjs/common';
import { AuthClientGrpc } from './auth.grpc';
import { CameraController } from './camera.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PROTO_PATHS } from '@eyenest/contracts';
import { CreateLocationUseCase } from '@/application/useCases/camera/createLocation.useCase';
import { LinkCameraUseCase } from '@/application/useCases/camera/linkCamera.useCase';
import { ICameraService } from '@/domain/services/camera.service';
import { CameraService } from '@/infrastructure/services/camera.service';
import { AddCameraUseCase } from '@/application/useCases/camera/addCamera.useCase';
import { RefreshUseCase } from '@/application/useCases/camera/refresh.useCase';
import { GetLinkCameraTokenUseCase } from '@/application/useCases/camera/getLinkCameraToken.useCase';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth.v1',
            protoPath: PROTO_PATHS.AUTH,
            url: configService.getOrThrow('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CameraController],
  providers: [
    {
      provide: ICameraRepository,
      useClass: CameraRepository,
    },
    {
      provide: ICameraService,
      useClass: CameraService,
    },
    AuthClientGrpc,
    GetLocationsByUserIdUseCase,
    CreateLocationUseCase,
    LinkCameraUseCase,
    AddCameraUseCase,
    RefreshUseCase,
    GetLinkCameraTokenUseCase,
  ],
})
export class CameraModule {}

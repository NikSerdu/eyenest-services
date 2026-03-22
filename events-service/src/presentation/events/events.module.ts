import { IEventRepository } from '@/domain';
import { EventRepository } from '@/infrastructure/repositories/event.repository';
import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PROTO_PATHS } from '@eyenest/contracts';
import { ICameraService } from '@/domain/services/camera.service';
import { CameraService } from '@/infrastructure/services/camera.service';
import { CreateEventUseCase } from '@/application/useCases/event/createEvent.useCase';
import { EventEmitterModule } from '@eyenest/common';
import { CameraClientGrpc } from '@/infrastructure/grpc/clients/camera.grpc';
import { GetEventsByCameraIdUseCase } from '@/application/useCases/event/getEventsByUserId.useCase';
import { DeleteEventsByCameraIdUseCase } from '@/application/useCases/event/deleteEventsByCameraId.useCase';

@Module({
  imports: [
    EventEmitterModule.register('RMQ_CLIENT'),
    ClientsModule.registerAsync([
      {
        name: 'CAMERA_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'camera.v1',
            protoPath: PROTO_PATHS.CAMERA,
            url: configService.getOrThrow('CAMERA_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [
    {
      provide: IEventRepository,
      useClass: EventRepository,
    },
    {
      provide: ICameraService,
      useClass: CameraService,
    },
    CameraClientGrpc,
    CreateEventUseCase,
    GetEventsByCameraIdUseCase,
    DeleteEventsByCameraIdUseCase,
  ],
})
export class EventsModule {}

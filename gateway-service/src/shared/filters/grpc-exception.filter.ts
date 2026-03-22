import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { grpcToHttpStatus } from '../utils';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  public catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (this.isGrpcError(exception)) {
      const status = grpcToHttpStatus[exception.code] || 500;

      return response.status(status).json({
        statusCode: status,
        message: exception.details || 'gRPC error',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      return response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  }

  private isGrpcError(exception: any) {
    return (
      typeof exception === 'object' &&
      'code' in exception &&
      'details' in exception
    );
  }
}

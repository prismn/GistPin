import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProd = process.env.NODE_ENV === 'production';

    let statusCode: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ?? exception.message);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProd
        ? 'Internal server error'
        : ((exception as Error)?.message ?? 'Unknown error');
    }

    const body: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Log with stack trace in non-prod
    if (statusCode >= 500) {
      const stack = !isProd && exception instanceof Error ? exception.stack : '';
      this.logger.error(`${request.method} ${request.url} → ${statusCode}`, stack);
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode}: ${JSON.stringify(message)}`,
      );
    }

    response.status(statusCode).json(body);
  }
}

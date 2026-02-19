import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') ?? '-';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms - ${ip} - ${userAgent}`);
        },
        error: (err: { status?: number }) => {
          const duration = Date.now() - startTime;
          const statusCode = err?.status ?? 500;
          this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`);
        },
      }),
    );
  }
}

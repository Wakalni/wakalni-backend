import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new DailyRotateFile({
        filename: 'logs/response-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '120d'
      }),
      new transports.Console()
    ],
  });

  private getClientIp(request: any): string {
    return request.ip || 
           request.headers['x-forwarded-for'] || 
           request.connection?.remoteAddress || 
           'unknown';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(request);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;

        this.logger.info('', {
          ip: clientIp,
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          userAgent: request.headers['user-agent']
        });
      })
    );
  }
}
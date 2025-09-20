import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.set('query parser', 'extended')
    const configService = app.get(ConfigService);

  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3000').split(',');
  const corsMethods = configService.get('CORS_METHODS', 'GET,POST,PUT,PATCH,DELETE,OPTIONS').split(',');
  const corsAllowedHeaders = configService.get('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization').split(',');
  const corsExposedHeaders = configService.get('CORS_EXPOSED_HEADERS', 'Authorization').split(',');
  const corsCredentials = configService.get('CORS_CREDENTIALS', 'true') === 'true';
  const corsMaxAge = parseInt(configService.get('CORS_MAX_AGE', '86400'), 10);

  app.enableCors({
    origin: corsOrigins,
    methods: corsMethods,
    allowedHeaders: corsAllowedHeaders,
    exposedHeaders: corsExposedHeaders,
    credentials: corsCredentials,
    maxAge: corsMaxAge,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

    await app.listen(process.env.PORT ?? 8000)
}
bootstrap()

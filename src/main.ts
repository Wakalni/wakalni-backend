import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.set('query parser', 'extended')
  app.use(cookieParser())
  const configService = app.get(ConfigService);
  const version = configService.get('API_VERSION', '0');
  const apiPrefix = `api/v${version}`
  app.setGlobalPrefix(apiPrefix); 
  const port = configService.get<number>('PORT')!;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('easyDine API')
    .setDescription('easyDine Swagger API documentation')
    .setVersion(version)
    .addApiKey({
      type: 'apiKey',
      in: 'cookie',
      name: 'access-token',
      description: 'Access Token Cookie'
    }, 'access-token-cookie')
    .addApiKey({
      type: 'apiKey',
      in: 'cookie', 
      name: 'refresh-token',
      description: 'Refresh Token Cookie'
    }, 'refresh-token-cookie')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  await app.listen(port)
}
bootstrap()

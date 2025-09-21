import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.set('query parser', 'extended')
    const configService = app.get(ConfigService);

  const version = configService.get('API_VERSION', '0');
  app.setGlobalPrefix(`api/v${version}`); 
  await app.listen(process.env.PORT ?? 8000)
}
bootstrap()

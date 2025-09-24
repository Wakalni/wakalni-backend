import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.set('query parser', 'extended')
    app.use(cookieParser())
    const configService = app.get(ConfigService);
  const version = configService.get('API_VERSION', '0');
  app.setGlobalPrefix(`api/v${version}`); 
  await app.listen(process.env.PORT ?? 8000)
}
bootstrap()

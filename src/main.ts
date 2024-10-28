import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(helmet());
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('Blockchain Price Tracker')
    .setDescription('Track blockchain prices and set alerts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('SERVER_PORT') ?? 3000, () => {
    console.log(`Server is running, the address is localhost:${configService.get<string>('SERVER_PORT')}`);
  });
}
bootstrap();

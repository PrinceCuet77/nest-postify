import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/response.interceptor.js';
import config from './config/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');

  app.enableCors({
    origin: [config.frontend_url, 'googleusercontent.com'], // Allow only this origin
    credentials: true, // Allow cookies to be sent
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  // await app.listen(process.env.PORT ?? 3000);
  await app.listen(config.port ?? 3000);
}
await bootstrap();

import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  // logger registers a logger instance with the name 'bootstrap'
  const logger = new Logger('bootstrap', {
    timestamp: true,
  });

  // create a Nest application instance
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // register a global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // start the application on port 3000
  await app.listen({
    port: 3000,
  });

  // log a message to the console
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

// call the bootstrap function
bootstrap();

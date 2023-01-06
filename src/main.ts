import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // this is used to load the .env file
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

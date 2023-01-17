import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SlackService } from './services/slack/slack.service';

async function bootstrap() {
  dotenv.config(); // this is used to load the .env file
  const app = await NestFactory.create(AppModule);

  // const slackService = app.get<SlackService>(SlackService);
  // slackService.start();

  await app.listen(3000);
}
bootstrap();

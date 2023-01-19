import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SlackService } from './slack/slack.service';

async function bootstrap() {
  dotenv.config(); // this is used to load the .env file
  const app = await NestFactory.create(AppModule);

  // const slackService = app.get<SlackService>(SlackService);
  // slackService.start();
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
bootstrap();

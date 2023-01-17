import { SlackEventAdapter } from '@slack/events-api';
import { WebClient } from '@slack/web-api';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

const { SLACK_SIGNING_SECRET, SLACK_TOKEN, SLACK_PORT } = process.env;

@Injectable()
export class SlackService {
  //   private readonly events = new SlackEventAdapter(
  //     'fd1f6fdb22d8e0a7c448477c6f1a8daa',
  //   );
  private readonly webClient = new WebClient(
    'xoxb-1093340235939-4626872845750-w6w1QMIMWvxZLAENGtM3bZYp',
  );
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly usersService: UsersService) {}
  //
  async handleEventRequest(body: any) {
    const { text, channel } = body;
    if (text.startsWith('!blockchain')) {
      return;
    }
    const command = text.split(' ')[1];
    try {
      switch (command) {
        case '/latest': {
          const latestBlockData = await this.usersService.getLatestBlockData();
          await this.webClient.chat.postMessage({
            channel: channel,
            text: `Latest block data: ${latestBlockData}`,
          });
          break;
        }
        case '/transaction': {
          const hash = text.split(' ')[2];
          const transactionData = await this.usersService.getTransactionData(
            hash,
          );
          await this.webClient.chat.postMessage({
            channel: channel,
            text: `Transaction data: ${transactionData}`,
          });
          break;
        }
        default: {
          await this.webClient.chat.postMessage({
            channel: channel,
            text: 'Invalid command. Use "!blockchain latest" or "!blockchain transaction [transaction hash]"',
          });
          break;
        }
      }
    } catch (error) {
      this.logger.error(`Request failed: ${error}`);
      throw new HttpException(
        'Request failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //   async start() {
  //     this.events.start(3003).then(() => {
  //       this.logger.log('Slack Event Adapter listening.');
  //     });
  //   }
}

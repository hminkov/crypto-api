import { Body, Controller, Get } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller()
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get()
  handleSlackEvents(@Body() body: any) {
    return this.slackService.handleEventRequest(body);
  }
}

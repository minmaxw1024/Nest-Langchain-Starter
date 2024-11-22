import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('/answer')
  async getAnswer(
    @Query('question') question: string,
  ): Promise<{ answer: string }> {
    // decode the question
    const input = decodeURIComponent(question);
    this.logger.debug(`Received question: ${input}`);
    return await this.chatService.getAnswer(input);
  }
}

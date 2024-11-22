import { Controller, Get, Query } from '@nestjs/common';
import { RagChatService } from './ragChat.service';

@Controller('rag-chat')
export class RagChatController {
  constructor(private readonly ragChatService: RagChatService) {}

  @Get()
  async getAnswer(@Query('question') question: string): Promise<{ answer: string }> {
    return await this.ragChatService.getAnswer(question);
  }
}

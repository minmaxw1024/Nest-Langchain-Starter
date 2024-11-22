import { Module } from '@nestjs/common';
import { RagChatService } from './ragChat.service';
import { RagChatController } from './ragChat.controller';

@Module({
  controllers: [RagChatController],
  providers: [RagChatService],
})
export class RagChatModule {}

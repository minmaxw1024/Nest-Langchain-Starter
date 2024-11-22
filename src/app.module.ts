import { Module } from '@nestjs/common';
import { HelloModule } from './modules/hello/hello.module';
import { ChatModule } from './modules/chat/chat.module';
import { RagChatModule } from './modules/ragChat/ragChat.module';
import { SearchModule } from './modules/search/search.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';

@Module({
  imports: [
    HelloModule,
    ChatModule,
    RagChatModule,
    SearchModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}

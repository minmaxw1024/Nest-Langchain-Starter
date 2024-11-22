import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from '@langchain/langgraph';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private app: any;

  private systemPrompt: string;
  private chatConfig: {
    configurable: {
      thread_id: string;
    };
  };

  constructor(private readonly config: ConfigService) {
    this.initializeModel();
  }

  private async initializeModel() {
    const model = new ChatOpenAI({
      apiKey: this.config.get('openaiApiKey'),
      modelName: 'gpt-4o-mini',
    });

    this.systemPrompt = `You are a chatbot that can answer questions. For any input:
    If the input is a question, reply with an answer to the question.`;

    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const outputParser = new StringOutputParser();
      const response = await model.pipe(outputParser).invoke(state.messages);
      return { messages: response };
    };

    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('model', callModel)
      .addEdge(START, 'model')
      .addEdge('model', END);

    const memory = new MemorySaver();

    // 模型
    this.app = workflow.compile({ checkpointer: memory });

    // 配置
    this.chatConfig = {
      configurable: {
        thread_id: uuidv4(),
      },
    };
  }

  async getAnswer(question: string): Promise<{ answer: string }> {
    try {
      const input = [
        {
          role: 'user',
          content: question,
        },
      ];
      const output = await this.app.invoke(
        { messages: input },
        {
          configurable: {
            thread_id: uuidv4(),
          },
        },
      );

      const answer = output.messages[output.messages.length - 1].content;
      console.log(answer);
      return { answer };
    } catch (error) {
      console.error(error);
      return { answer: 'An error occurred while processing your request.' };
    }
  }
}

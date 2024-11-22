import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagChatService {
  private ragChain: any; // Replace 'any' with proper type from LangChain

  constructor(private readonly config: ConfigService) {
    this.initializeRagChain();
  }

  private async initializeRagChain() {
    try {
      const openaiApiKey = this.config.get('openaiApiKey');
      const loader = new CheerioWebBaseLoader(
        'https://lilianweng.github.io/posts/2023-06-23-agent/',
        {
          selector: '.post-content, .post-title, .post-header',
        },
      );
      const docs = await loader.load();

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splits = await textSplitter.splitDocuments(docs);
      const vectorstore = await MemoryVectorStore.fromDocuments(
        splits,
        new OpenAIEmbeddings(),
      );
      const retriever = vectorstore.asRetriever();

      const systemPrompt =
        'You are an assistant for question-answering tasks. ' +
        'Use the following pieces of retrieved context to answer ' +
        "the question. If you don't know the answer, say that you " +
        "don't know. Use three sentences maximum and keep the " +
        'answer concise.\n\n{context}';

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['human', '{input}'],
      ]);

      const llm = new ChatOpenAI({
        apiKey: openaiApiKey,
        modelName: 'gpt-4o-mini',
        temperature: 0.5,
      });

      const questionAnswerChain = await createStuffDocumentsChain({
        llm,
        prompt,
      });

      this.ragChain = await createRetrievalChain({
        retriever,
        combineDocsChain: questionAnswerChain,
      });
    } catch (error) {
      console.error('Failed to initialize RAG chain:', error);
      throw error;
    }
  }

  async getAnswer(question: string) {
    try {
      if (!this.ragChain) {
        throw new Error('RAG chain not initialized');
      }

      const response = await this.ragChain.invoke({
        input: question,
      });

      if (response?.answer) {
        return {
          answer: response.answer,
        };
      } else {
        return {
          answer: 'I don\'t know the answer to that question.',
        };
      }
    } catch (error) {
      console.error('Error getting answer:', error);
      throw error;
    }
  }
}

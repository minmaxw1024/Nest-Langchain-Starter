export declare global {
  type AnyObject = Record<string, unknown>;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;

      OPENAI_API_KEY: string;
    }
  }
}

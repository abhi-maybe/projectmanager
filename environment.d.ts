// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // app base url
      NEXT_PUBLIC_APP_BASE_URL: string;

      // serverless cloud fallback database (Vercel KV / Upstash Redis)
      KV_REST_API_URL?: string;
      KV_REST_API_TOKEN?: string;
      UPSTASH_REDIS_REST_URL?: string;
      UPSTASH_REDIS_REST_TOKEN?: string;
    }
  }
}

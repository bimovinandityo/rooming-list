import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_ENV: z.enum(["development", "staging", "production"]),
    NEXT_PUBLIC_CLIENT_NAME: z.string().min(1),
    NEXT_PUBLIC_CLIENT_VERSION: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_CLIENT_NAME: process.env.NEXT_PUBLIC_CLIENT_NAME,
    NEXT_PUBLIC_CLIENT_VERSION: process.env.NEXT_PUBLIC_CLIENT_VERSION,
  },
});

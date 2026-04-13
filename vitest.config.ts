import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    env: {
      OPENAI_API_KEY: "test-key",
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://localhost:8000/graphql",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_ENV: "development",
      NEXT_PUBLIC_CLIENT_NAME: "rooming-list",
      NEXT_PUBLIC_CLIENT_VERSION: "0.1.0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

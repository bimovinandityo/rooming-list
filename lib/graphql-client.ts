import { GraphQLClient, ClientError } from "graphql-request";
import { env } from "@/lib/env";

const endpoint = env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

export const graphqlClient = new GraphQLClient(endpoint, {
  credentials: "include",
  headers: {
    "x-graphql-client-name": env.NEXT_PUBLIC_CLIENT_NAME,
    "x-graphql-client-version": env.NEXT_PUBLIC_CLIENT_VERSION,
  },
});

// Singleton refresh state — prevents concurrent refresh attempts
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function fetcher<TData, TVariables extends Record<string, unknown>>(
  query: string | { toString(): string },
  variables?: TVariables,
) {
  const queryString = query.toString();
  return async (): Promise<TData> => {
    try {
      return await graphqlClient.request<TData>(queryString, variables ?? undefined);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          return await graphqlClient.request<TData>(queryString, variables ?? undefined);
        }
        window.location.href = "/login";
        return new Promise<TData>(() => {});
      }
      throw error;
    }
  };
}

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ClientError) {
    if (error.response.status === 401) return true;
    const gqlErrors = error.response.errors;
    if (gqlErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED")) return true;
  }
  return false;
}

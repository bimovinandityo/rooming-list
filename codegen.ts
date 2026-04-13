import type { CodegenConfig } from "@graphql-codegen/cli";

const scalars = {
  ID: "string",
  Date: "Date",
  DateTime: "string",
};

const config = {
  schema: process.env.GRAPHQL_ENDPOINT ?? "http://localhost:8000/graphql",
  documents: ["./features/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "types/introspection.generated.json": {
      plugins: ["fragment-matcher"],
    },
    "types/types.generated.ts": {
      plugins: ["typescript"],
      config: {
        scalars,
        namingConvention: {
          enumValues: "change-case-all#upperCase",
        },
        onlyOperationTypes: false,
        omitInputObjectType: true,
        skipDocumentsValidation: true,
        nonOptionalTypename: true,
      },
    },
    "~": {
      preset: "near-operation-file",
      presetConfig: {
        baseTypesPath: "../types/types.generated.ts",
        extension: ".generated.ts",
      },
      plugins: [
        {
          add: {
            content:
              "class TypedDocumentString<TResult = Record<string, unknown>, TVariables = Record<string, unknown>> extends String { __apiType?: { result: TResult; variables: TVariables }; }",
          },
        },
        "typescript-operations",
        "typescript-react-query",
      ],
      config: {
        fetcher: {
          func: "@/lib/graphql-client#fetcher",
        },
        exposeQueryKeys: true,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        scalars,
        reactQueryVersion: 5,
        documentMode: "string",
      },
    },
  },
} satisfies CodegenConfig;

export default config;

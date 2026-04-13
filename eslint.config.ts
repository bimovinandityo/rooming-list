import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "types/**",
    "**/*.generated.ts",
    "locales/compiled/**",
  ]),
  // Architecture enforcement: layered imports
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/!(index)*"],
              message:
                "Import from feature barrel (index.ts) only. Direct internal imports break encapsulation.",
            },
            {
              group: ["@/app/*"],
              message: "Never import from app/ — it's a routing layer, not a library.",
            },
          ],
        },
      ],
    },
  },
  // shared/ cannot import from features/ or app/
  {
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*"],
              message: "shared/ must not import from features/",
            },
            {
              group: ["@/app/*"],
              message: "shared/ must not import from app/",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const augmentWithRoot = (configArray) =>
  configArray.map((config) => ({
    ...config,
    settings: {
      ...(config.settings ?? {}),
      next: {
        ...(config.settings?.next ?? {}),
        rootDir: ["apps/web"],
      },
    },
  }));

const eslintConfig = defineConfig([
  ...augmentWithRoot(nextVitals),
  ...augmentWithRoot(nextTs),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

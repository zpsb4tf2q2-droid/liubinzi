import { defineConfig } from "eslint/config";

import { next as nextPreset } from "@project/shared/eslint-preset";

export default defineConfig([
  ...nextPreset
]);

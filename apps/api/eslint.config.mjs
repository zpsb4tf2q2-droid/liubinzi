import { defineConfig } from "eslint/config";

import { node as nodePreset } from "@project/shared/eslint-preset";

export default defineConfig([
  ...nodePreset
]);

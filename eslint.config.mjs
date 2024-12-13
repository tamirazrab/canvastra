// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { getPresets } from "eslint-config-molindo";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [{
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  languageOptions: { globals: { ...globals.browser, ...globals.node } },
}, tseslint.configs.recommended, pluginReact.configs.flat.recommended, ...(await getPresets(
  // Base config
  "typescript", // or 'javascript'

  // Optional extensions
  "react",
  "cssModules",
  "tailwind",
  "jest",
  "cypress",
  "vitest",
)), ...storybook.configs["flat/recommended"]];

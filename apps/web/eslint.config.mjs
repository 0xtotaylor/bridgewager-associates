import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ["src/components/hedge-fund-tabs.tsx"]
  },
  {
    rules: {
      // Disable no-unused-vars rule
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      
      // Allow 'any' types
      "@typescript-eslint/no-explicit-any": "off",
      
      // Allow require statements (for dynamic imports)
      "@typescript-eslint/no-var-requires": "off",
      
      // Allow non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // Allow empty functions
      "@typescript-eslint/no-empty-function": "off",
      
      // Allow @ts-ignore comments
      "@typescript-eslint/ban-ts-comment": "off"
    }
  }
];

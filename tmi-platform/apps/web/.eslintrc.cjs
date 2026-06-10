module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Prevent importing other packages' internals (only allow their public entrypoints)
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "../../packages/*/src/*",
          "../../packages/*/src/**",
          "../packages/*/src/*",
          "../packages/*/src/**",
          "../../packages/*/*/src/*",
          "../../**/src/*"
        ]
      }
    ],
    // Downgrade to warn — TS typecheck already catches real type errors
    "@typescript-eslint/no-unused-vars": ["warn", {
      "vars": "all",
      "args": "after-used",
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react/no-unescaped-entities": "warn",
    "jsx-a11y/alt-text": "warn",
    "@next/next/no-img-element": "warn",
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }]
  }
};

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
    ]
  }
};

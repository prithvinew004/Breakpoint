import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "dependency-audit-policy",
          root: "./scripts",
          include: ["test/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "shared",
          root: "./packages/shared",
          include: ["test/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "api",
          root: "./apps/api",
          include: ["test/**/*.test.ts"],
        },
      },
    ],
  },
});

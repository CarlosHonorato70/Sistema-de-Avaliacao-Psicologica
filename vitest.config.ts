import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["server/**/*.ts"],
      exclude: [
        "server/**/*.test.ts",
        "server/**/*.spec.ts",
        "server/_core/types/**",
        "node_modules/**",
      ],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
      all: true,
    },
  },
});

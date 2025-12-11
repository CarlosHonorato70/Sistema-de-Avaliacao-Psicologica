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
      // Coverage thresholds - can be overridden via COVERAGE_THRESHOLD env var
      statements: parseInt(process.env.COVERAGE_THRESHOLD || "80"),
      branches: parseInt(process.env.COVERAGE_THRESHOLD || "80"),
      functions: parseInt(process.env.COVERAGE_THRESHOLD || "80"),
      lines: parseInt(process.env.COVERAGE_THRESHOLD || "80"),
      all: true,
    },
  },
});

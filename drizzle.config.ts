import { defineConfig } from "drizzle-kit";

const databasePath = process.env.DATABASE_PATH || "./data/database.sqlite";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databasePath,
  },
});

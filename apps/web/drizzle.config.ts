import { defineConfig } from "drizzle-kit";
import { readDbEnv } from "./src/env";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: readDbEnv(process.env).DATABASE_URL
  }
});

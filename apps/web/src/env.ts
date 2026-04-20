import { z } from "zod";

const appEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OWNER_EMAIL: z.string().email()
});

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url()
});

export type AppEnv = z.infer<typeof appEnvSchema>;
export type DbEnv = z.infer<typeof dbEnvSchema>;

export function readEnv(source: Record<string, string | undefined>): AppEnv {
  return appEnvSchema.parse(source);
}

export function readDbEnv(source: Record<string, string | undefined>): DbEnv {
  return dbEnvSchema.parse(source);
}

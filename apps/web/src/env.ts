import { z } from "zod";

const appEnvSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  EMAIL_SERVER: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  DATABASE_URL: z.string().url(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default("gemini-3-flash-preview"),
  OWNER_EMAIL: z.string().email()
});

const aiEnvSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default("gemini-3-flash-preview")
});

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url()
});

export type AppEnv = z.infer<typeof appEnvSchema>;
export type AiEnv = z.infer<typeof aiEnvSchema>;
export type DbEnv = z.infer<typeof dbEnvSchema>;

export function readEnv(source: Record<string, string | undefined>): AppEnv {
  return appEnvSchema.parse(source);
}

export function readAiEnv(source: Record<string, string | undefined>): AiEnv {
  return aiEnvSchema.parse(source);
}

export function readDbEnv(source: Record<string, string | undefined>): DbEnv {
  return dbEnvSchema.parse(source);
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as authSchema from "@/db/schema/auth";
import * as appSchema from "@/db/schema/app";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema: {
    ...authSchema,
    ...appSchema
  }
});

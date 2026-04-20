import { and, desc, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/app";
import { TokenSettingsPanel } from "@/components/settings/token-settings-panel";

export default async function TokenSettingsPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  const initialTokens = ownerId
    ? await db
        .select({
          id: apiTokens.id,
          label: apiTokens.label,
          createdAt: apiTokens.createdAt,
          lastUsedAt: apiTokens.lastUsedAt,
        })
        .from(apiTokens)
        .where(and(eq(apiTokens.ownerId, ownerId), isNull(apiTokens.revokedAt)))
        .orderBy(desc(apiTokens.createdAt))
    : [];

  return (
    <TokenSettingsPanel
      initialTokens={initialTokens.map((token) => ({
        id: token.id,
        label: token.label,
        createdAt: token.createdAt.toISOString(),
        lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
      }))}
    />
  );
}

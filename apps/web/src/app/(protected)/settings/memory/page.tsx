import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { memoryItems } from "@/db/schema/app";
import { MemorySettingsPanel } from "@/components/settings/memory-settings-panel";

export default async function MemorySettingsPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  const initialItems = ownerId
    ? await db
        .select({
          id: memoryItems.id,
          label: memoryItems.label,
          value: memoryItems.value,
        })
        .from(memoryItems)
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.isActive, true)))
        .orderBy(desc(memoryItems.updatedAt))
    : [];

  return <MemorySettingsPanel initialItems={initialItems} />;
}

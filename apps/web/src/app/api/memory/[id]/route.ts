import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { memoryItems } from "@/db/schema/app";
import { writeAuditLog } from "@/server/audit/audit-log";
import { createMemoryService } from "@/server/memory/memory-service";

function createMemoryRepository() {
  return createMemoryService({
    insertMemory: async ({ ownerId, label, value }) => {
      const [created] = await db
        .insert(memoryItems)
        .values({ ownerId, label, value })
        .returning({
          id: memoryItems.id,
          label: memoryItems.label,
          value: memoryItems.value
        });

      if (!created) {
        throw new Error("Failed to create memory item");
      }

      return created;
    },
    listMemory: async (ownerId) => {
      return db
        .select({
          id: memoryItems.id,
          label: memoryItems.label,
          value: memoryItems.value
        })
        .from(memoryItems)
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.isActive, true)));
    },
    deleteMemory: async ({ ownerId, id }) => {
      await db
        .delete(memoryItems)
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.id, id)));
    },
    writeAudit: writeAuditLog
  });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createMemoryRepository();

  await service.remove({
    ownerId: session.user.id,
    id,
    authMethod: "session"
  });

  return NextResponse.json({ deleted: true, id });
}

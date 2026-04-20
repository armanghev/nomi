import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { auditLogs, memoryItems } from "@/db/schema/app";
import { createMemoryService } from "@/server/memory/memory-service";

function createMemoryRepository() {
  return createMemoryService({
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
    transaction: async (callback) =>
      db.transaction(async (tx) =>
        callback({
          insertMemory: async ({ ownerId, label, value }) => {
            const [created] = await tx
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
          deleteMemory: async ({ ownerId, id }) => {
            await tx
              .delete(memoryItems)
              .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.id, id)));
          },
          writeAudit: async (entry) => {
            await tx.insert(auditLogs).values({
              ownerId: entry.ownerId,
              authMethod: entry.authMethod,
              action: entry.action,
              resourceType: entry.resourceType,
              resourceId: entry.resourceId,
              metadata: {}
            });
          }
        })
      )
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

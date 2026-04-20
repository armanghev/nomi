import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { memoryItems } from "@/db/schema/app";
import { writeAuditLog } from "@/server/audit/audit-log";
import { createMemoryService } from "@/server/memory/memory-service";

const createMemorySchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

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
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.isActive, true)))
        .orderBy(desc(memoryItems.updatedAt));
    },
    deleteMemory: async ({ ownerId, id }) => {
      await db
        .delete(memoryItems)
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.id, id)));
    },
    writeAudit: writeAuditLog
  });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createMemoryRepository();
  const items = await service.list(session.user.id);

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createMemorySchema.parse(await request.json());
  const service = createMemoryRepository();

  const created = await service.create({
    ownerId: session.user.id,
    label: body.label,
    value: body.value,
    authMethod: "session"
  });

  return NextResponse.json(created, { status: 201 });
}

import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, memoryItems } from "@/db/schema/app";
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { createMemoryService } from "@/server/memory/memory-service";

const createMemorySchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
});

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
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.isActive, true)))
        .orderBy(desc(memoryItems.updatedAt));
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

export async function GET(request: Request) {
  const requestAuth = await resolveRequestAuth(request);

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createMemoryRepository();
  const items = await service.list(requestAuth.ownerId);

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const requestAuth = await resolveRequestAuth(request);

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createMemorySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createMemoryRepository();

  const created = await service.create({
    ownerId: requestAuth.ownerId,
    label: parsed.data.label,
    value: parsed.data.value,
    authMethod: requestAuth.authMethod
  });

  return NextResponse.json(created, { status: 201 });
}

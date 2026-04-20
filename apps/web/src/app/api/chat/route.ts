import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { apiTokens, conversations, memoryItems, messages } from "@/db/schema/app";
import {
  ChatConversationNotFoundError,
  createChatService
} from "@/server/chat/chat-service";
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { generateAssistantReply } from "@/server/ai/model";
import { writeAuditLog } from "@/server/audit/audit-log";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  content: z.string().min(1)
});

function createChatRepository() {
  return createChatService({
    generateReply: ({ prompt, memory }) => generateAssistantReply(prompt, memory),
    getConversation: async ({ ownerId, id }) => {
      const [conversation] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(and(eq(conversations.ownerId, ownerId), eq(conversations.id, id)))
        .limit(1);

      return conversation ?? null;
    },
    createConversation: async ({ ownerId, title }) => {
      const [conversation] = await db
        .insert(conversations)
        .values({
          ownerId,
          title
        })
        .returning({
          id: conversations.id,
          title: conversations.title
        });

      return conversation;
    },
    saveMessage: async ({ conversationId, role, content }) => {
      await db.transaction(async (tx) => {
        await tx.insert(messages).values({
          conversationId,
          role,
          content
        });
        await tx
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));
      });
    },
    loadActiveMemory: async (ownerId) => {
      return db
        .select({
          label: memoryItems.label,
          value: memoryItems.value
        })
        .from(memoryItems)
        .where(and(eq(memoryItems.ownerId, ownerId), eq(memoryItems.isActive, true)));
    },
    writeAudit: writeAuditLog
  });
}

export async function POST(request: Request) {
  const requestAuth = await resolveRequestAuth(request, {
    lookupTokenOwnerId: async (tokenHash) => {
      const [token] = await db
        .select({
          ownerId: apiTokens.ownerId
        })
        .from(apiTokens)
        .where(and(eq(apiTokens.tokenHash, tokenHash), isNull(apiTokens.revokedAt)))
        .limit(1);

      return token?.ownerId ?? null;
    }
  });

  if (!requestAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = requestSchema.parse(await request.json());
  const service = createChatRepository();

  try {
    const result = await service.sendMessage({
      ownerId: requestAuth.ownerId,
      conversationId: body.conversationId,
      content: body.content,
      authMethod: requestAuth.authMethod
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatConversationNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    throw error;
  }
}

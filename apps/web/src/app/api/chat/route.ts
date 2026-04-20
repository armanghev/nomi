import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { apiTokens } from "@/db/schema/app";
import { createChatService } from "@/server/chat/chat-service";
import { resolveRequestAuth } from "@/server/authz/resolve-request-auth";
import { generateAssistantReply } from "@/server/ai/model";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  content: z.string().min(1)
});

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

  const service = createChatService({
    generateReply: ({ prompt, memory }) => generateAssistantReply(prompt, memory),
    createConversation: async ({ title }) => ({
      id: crypto.randomUUID(),
      title
    }),
    saveMessage: async () => {},
    loadActiveMemory: async () => [],
    writeAudit: async () => {}
  });

  const result = await service.sendMessage({
    ownerId: requestAuth.ownerId,
    conversationId: body.conversationId,
    content: body.content,
    authMethod: requestAuth.authMethod
  });

  return NextResponse.json(result);
}

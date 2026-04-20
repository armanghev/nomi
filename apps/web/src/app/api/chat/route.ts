import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createChatService } from "@/server/chat/chat-service";
import { generateAssistantReply } from "@/server/ai/model";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable(),
  content: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
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
    ownerId: session.user.id,
    conversationId: body.conversationId,
    content: body.content,
    authMethod: "session"
  });

  return NextResponse.json(result);
}

import { describe, expect, it, vi } from "vitest";
import { createChatService } from "./chat-service";

describe("createChatService", () => {
  it("persists the user message, assistant reply, and audit event", async () => {
    const saveMessage = vi.fn();
    const writeAudit = vi.fn();

    const service = createChatService({
      generateReply: async () => "Hello from Nomi",
      createConversation: async () => ({ id: "conv_1", title: "First message" }),
      saveMessage,
      loadActiveMemory: async () => [{ label: "Tone", value: "Be concise" }],
      writeAudit
    });

    const result = await service.sendMessage({
      ownerId: "owner_1",
      conversationId: null,
      content: "Help me refactor this function"
    });

    expect(result.conversationId).toBe("conv_1");
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "chat.message.created",
        authMethod: "session"
      })
    );
  });
});

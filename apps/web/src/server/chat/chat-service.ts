type ChatInput = {
  ownerId: string;
  conversationId: string | null;
  content: string;
  authMethod?: "session" | "token";
};

type ChatDependencies = {
  generateReply: (args: {
    prompt: string;
    memory: Array<{ label: string; value: string }>;
  }) => Promise<string>;
  getConversation: (args: {
    ownerId: string;
    id: string;
  }) => Promise<{ id: string } | null>;
  createConversation: (args: {
    ownerId: string;
    title: string;
  }) => Promise<{ id: string; title: string }>;
  saveMessage: (args: {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
  }) => Promise<void>;
  loadActiveMemory: (
    ownerId: string
  ) => Promise<Array<{ label: string; value: string }>>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session" | "token";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

export class ChatConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`Conversation not found: ${conversationId}`);
    this.name = "ChatConversationNotFoundError";
  }
}

export function createChatService(deps: ChatDependencies) {
  return {
    async sendMessage(input: ChatInput) {
      const conversation =
        input.conversationId !== null
          ? await deps.getConversation({
              ownerId: input.ownerId,
              id: input.conversationId
            })
          : await deps.createConversation({
              ownerId: input.ownerId,
              title: input.content.slice(0, 80)
            });

      if (!conversation) {
        throw new ChatConversationNotFoundError(input.conversationId ?? "");
      }

      const memory = await deps.loadActiveMemory(input.ownerId);
      await deps.saveMessage({
        conversationId: conversation.id,
        role: "user",
        content: input.content
      });

      const reply = await deps.generateReply({ prompt: input.content, memory });

      await deps.saveMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: reply
      });
      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "chat.message.created",
        resourceType: "conversation",
        resourceId: conversation.id
      });

      return {
        conversationId: conversation.id,
        reply
      };
    }
  };
}

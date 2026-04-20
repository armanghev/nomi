export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
};

export type ConversationDetail = ConversationSummary & {
  messages: ChatMessage[];
};

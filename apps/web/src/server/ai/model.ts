import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { readEnv } from "@/env";

type MemoryItem = {
  label: string;
  value: string;
};

export async function generateAssistantReply(
  prompt: string,
  memory: Array<MemoryItem>
) {
  const env = readEnv(process.env);
  const memoryContext = memory.length
    ? memory.map((item) => `${item.label}: ${item.value}`).join("\n")
    : "No active memory.";

  const result = await generateText({
    model: google(env.GEMINI_MODEL),
    system: [
      "You are Nomi, a concise technical assistant.",
      "Use active memory when it helps answer the user.",
      "Active memory:",
      memoryContext
    ].join("\n"),
    prompt
  });

  return result.text.trim();
}

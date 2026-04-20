import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatScreen } from "./chat-screen";

describe("ChatScreen", () => {
  it("submits a message from the composer", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(<ChatScreen messages={[]} onSend={onSend} isSending={false} />);

    fireEvent.change(screen.getByPlaceholderText("Ask Nomi anything"), {
      target: { value: "Summarize my day" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith("Summarize my day");
    });
  });
});

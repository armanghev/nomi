import { describe, expect, it, vi } from "vitest";
import { createHistoryService } from "./history-service";

describe("createHistoryService", () => {
  it("lists owner conversations", async () => {
    const listConversations = vi.fn().mockResolvedValue([{ id: "conv_1", title: "Refactor ideas" }]);
    const service = createHistoryService({
      listConversations,
      loadConversation: vi.fn(),
      deleteConversation: vi.fn()
    });

    await expect(service.list("owner_1")).resolves.toEqual([{ id: "conv_1", title: "Refactor ideas" }]);
    expect(listConversations).toHaveBeenCalledWith("owner_1");
  });
});

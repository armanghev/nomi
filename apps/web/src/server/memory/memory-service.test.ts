import { describe, expect, it, vi } from "vitest";
import { createMemoryService } from "./memory-service";

describe("createMemoryService", () => {
  it("creates an active memory item and writes an audit log", async () => {
    const insertMemory = vi
      .fn()
      .mockResolvedValue({ id: "mem_1", label: "School", value: "Prioritize deadlines" });
    const writeAudit = vi.fn();
    const service = createMemoryService({
      insertMemory,
      listMemory: vi.fn(),
      deleteMemory: vi.fn(),
      writeAudit
    });

    const created = await service.create({
      ownerId: "owner_1",
      label: "School",
      value: "Prioritize deadlines"
    });

    expect(created.id).toBe("mem_1");
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "memory.created", resourceType: "memory_item" })
    );
  });
});

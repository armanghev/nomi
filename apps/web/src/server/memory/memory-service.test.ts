import { describe, expect, it, vi } from "vitest";
import { createMemoryService } from "./memory-service";

describe("createMemoryService", () => {
  it("creates an active memory item and writes an audit log in one transaction", async () => {
    const insertMemory = vi
      .fn()
      .mockResolvedValue({ id: "mem_1", label: "School", value: "Prioritize deadlines" });
    const writeAudit = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        insertMemory,
        deleteMemory: vi.fn(),
        writeAudit
      })
    );

    const service = createMemoryService({
      transaction,
      listMemory: vi.fn()
    });

    const created = await service.create({
      ownerId: "owner_1",
      label: "School",
      value: "Prioritize deadlines"
    });

    expect(created.id).toBe("mem_1");
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insertMemory).toHaveBeenCalledWith({
      ownerId: "owner_1",
      label: "School",
      value: "Prioritize deadlines"
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "memory.created", resourceType: "memory_item" })
    );
  });

  it("deletes a memory item and writes an audit log in one transaction", async () => {
    const deleteMemory = vi.fn();
    const writeAudit = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        insertMemory: vi.fn(),
        deleteMemory,
        writeAudit
      })
    );

    const service = createMemoryService({
      transaction,
      listMemory: vi.fn()
    });

    await service.remove({
      ownerId: "owner_1",
      id: "mem_1"
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteMemory).toHaveBeenCalledWith({
      ownerId: "owner_1",
      id: "mem_1"
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "memory.deleted", resourceType: "memory_item" })
    );
  });
});

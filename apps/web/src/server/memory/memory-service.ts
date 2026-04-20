type MemoryItem = {
  id: string;
  label: string;
  value: string;
};

type MemoryTransactionDependencies = {
  insertMemory: (args: {
    ownerId: string;
    label: string;
    value: string;
  }) => Promise<MemoryItem>;
  deleteMemory: (args: { ownerId: string; id: string }) => Promise<void>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session" | "token";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

type MemoryDependencies = {
  listMemory: (ownerId: string) => Promise<MemoryItem[]>;
  transaction: <T>(
    callback: (deps: MemoryTransactionDependencies) => Promise<T>
  ) => Promise<T>;
};

export function createMemoryService(deps: MemoryDependencies) {
  return {
    async create(input: {
      ownerId: string;
      label: string;
      value: string;
      authMethod?: "session" | "token";
    }) {
      return deps.transaction(async (tx) => {
        const created = await tx.insertMemory(input);

        await tx.writeAudit({
          ownerId: input.ownerId,
          authMethod: input.authMethod ?? "session",
          action: "memory.created",
          resourceType: "memory_item",
          resourceId: created.id
        });

        return created;
      });
    },
    list(ownerId: string) {
      return deps.listMemory(ownerId);
    },
    async remove(input: {
      ownerId: string;
      id: string;
      authMethod?: "session" | "token";
    }) {
      return deps.transaction(async (tx) => {
        await tx.deleteMemory(input);

        await tx.writeAudit({
          ownerId: input.ownerId,
          authMethod: input.authMethod ?? "session",
          action: "memory.deleted",
          resourceType: "memory_item",
          resourceId: input.id
        });
      });
    }
  };
}

type MemoryDependencies = {
  insertMemory: (args: {
    ownerId: string;
    label: string;
    value: string;
  }) => Promise<{ id: string; label: string; value: string }>;
  listMemory: (
    ownerId: string
  ) => Promise<Array<{ id: string; label: string; value: string }>>;
  deleteMemory: (args: { ownerId: string; id: string }) => Promise<void>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session" | "token";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

export function createMemoryService(deps: MemoryDependencies) {
  return {
    async create(input: {
      ownerId: string;
      label: string;
      value: string;
      authMethod?: "session" | "token";
    }) {
      const created = await deps.insertMemory(input);

      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "memory.created",
        resourceType: "memory_item",
        resourceId: created.id
      });

      return created;
    },
    list(ownerId: string) {
      return deps.listMemory(ownerId);
    },
    async remove(input: {
      ownerId: string;
      id: string;
      authMethod?: "session" | "token";
    }) {
      await deps.deleteMemory(input);

      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "memory.deleted",
        resourceType: "memory_item",
        resourceId: input.id
      });
    }
  };
}

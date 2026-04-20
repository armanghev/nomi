type HistoryDependencies = {
  listConversations: (
    ownerId: string
  ) => Promise<Array<{ id: string; title: string }>>;
  loadConversation: (args: {
    ownerId: string;
    id: string;
  }) => Promise<
    | {
        id: string;
        title: string;
        messages: Array<{ id: string; role: string; content: string }>;
      }
    | null
  >;
  deleteConversation: (args: { ownerId: string; id: string }) => Promise<void>;
};

export function createHistoryService(deps: HistoryDependencies) {
  return {
    list(ownerId: string) {
      return deps.listConversations(ownerId);
    },
    get(ownerId: string, id: string) {
      return deps.loadConversation({ ownerId, id });
    },
    remove(ownerId: string, id: string) {
      return deps.deleteConversation({ ownerId, id });
    }
  };
}

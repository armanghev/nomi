export type AuditLogInput = {
  ownerId: string | null;
  authMethod: "session" | "token";
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(entry: AuditLogInput) {
  const { db } = await import("@/db");
  const { auditLogs } = await import("@/db/schema/app");

  await db.insert(auditLogs).values({
    ownerId: entry.ownerId,
    authMethod: entry.authMethod,
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    metadata: entry.metadata ?? {}
  });
}

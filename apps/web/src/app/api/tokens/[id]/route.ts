import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createTokenService } from "@/server/tokens/token-service";

function createRouteTokenService() {
  return createTokenService({
    insertToken: async () => ({ id: crypto.randomUUID() }),
    listTokens: async () => [],
    revokeToken: async () => {},
    writeAudit: async () => {}
  });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const service = createRouteTokenService();

  await service.revoke({
    ownerId: session.user.id,
    id
  });

  return NextResponse.json({ revoked: true, id });
}

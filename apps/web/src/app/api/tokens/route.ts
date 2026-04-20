import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createTokenService } from "@/server/tokens/token-service";

const createTokenSchema = z.object({
  label: z.string().min(1)
});

function createRouteTokenService() {
  return createTokenService({
    insertToken: async () => ({ id: crypto.randomUUID() }),
    listTokens: async () => [],
    revokeToken: async () => {},
    writeAudit: async () => {}
  });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createRouteTokenService();
  const tokens = await service.list(session.user.id);

  return NextResponse.json(tokens);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createTokenSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createRouteTokenService();
  const created = await service.create({
    ownerId: session.user.id,
    label: parsed.data.label
  });

  return NextResponse.json(
    {
      id: created.id,
      label: parsed.data.label,
      plaintextToken: created.plaintextToken
    },
    { status: 201 }
  );
}

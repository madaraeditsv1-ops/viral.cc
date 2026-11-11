import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, requireSameOrigin, sessionTokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tokenSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, "verify-email");
  if (rateLimitError) return rateLimitError;

  let tokenHash: string;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    const input = tokenSchema.parse(JSON.parse(body) as unknown);
    tokenHash = sessionTokenHash(input.token);
  } catch {
    return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
  }

  try {
    const verified = await prisma.$transaction(async (transaction) => {
      const now = new Date();
      const authToken = await transaction.authToken.findFirst({
        where: { tokenHash, purpose: "EMAIL_VERIFICATION", expiresAt: { gt: now } },
        select: { userId: true },
      });
      if (!authToken) return false;

      const consumed = await transaction.authToken.deleteMany({
        where: { tokenHash, purpose: "EMAIL_VERIFICATION", expiresAt: { gt: now } },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: authToken.userId },
        data: { emailVerifiedAt: now },
      });
      return true;
    });

    if (!verified) {
      return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
    }
    return NextResponse.json({ message: "Email verified. You can now sign in." });
  } catch (error) {
    console.error("Email verification failed.", error);
    return NextResponse.json({ error: "Email verification is temporarily unavailable." }, { status: 503 });
  }
}

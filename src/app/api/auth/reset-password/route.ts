import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, requireSameOrigin, sessionTokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  password: z.string().min(12).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, "reset-password");
  if (rateLimitError) return rateLimitError;

  let input: z.infer<typeof resetSchema>;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    input = resetSchema.parse(JSON.parse(body) as unknown);
  } catch {
    return NextResponse.json(
      { error: "Use a valid reset link and a password of at least 12 characters." },
      { status: 400 },
    );
  }

  const tokenHash = sessionTokenHash(input.token);
  try {
    const tokenExists = await prisma.authToken.findFirst({
      where: { tokenHash, purpose: "PASSWORD_RESET", expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!tokenExists) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await hash(input.password, 12);
    const reset = await prisma.$transaction(async (transaction) => {
      const now = new Date();
      const authToken = await transaction.authToken.findFirst({
        where: { tokenHash, purpose: "PASSWORD_RESET", expiresAt: { gt: now } },
        select: { userId: true },
      });
      if (!authToken) return false;

      const consumed = await transaction.authToken.deleteMany({
        where: { tokenHash, purpose: "PASSWORD_RESET", expiresAt: { gt: now } },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: authToken.userId },
        data: { passwordHash },
      });
      await transaction.session.deleteMany({ where: { userId: authToken.userId } });
      await transaction.authToken.deleteMany({ where: { userId: authToken.userId } });
      return true;
    });

    if (!reset) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }
    return NextResponse.json({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    console.error("Password reset failed.", error);
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
  }
}

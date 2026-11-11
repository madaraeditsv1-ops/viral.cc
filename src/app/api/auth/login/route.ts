import { compare, hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, enforceRateLimit, requireSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});
const dummyPasswordHash = hash("VIRALFLOW_NON_USER_PASSWORD", 12);

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, "login");
  if (rateLimitError) return rateLimitError;

  let input: z.infer<typeof loginSchema>;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    input = loginSchema.parse(JSON.parse(body) as unknown);
  } catch {
    return NextResponse.json({ error: "Enter a valid email address and password." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const storedHash = user?.passwordHash ?? (await dummyPasswordHash);
    const passwordMatches = await compare(input.password, storedHash);

    if (!user || !passwordMatches) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Verify your email address before signing in. You can request a new verification link." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username, image: user.image, role: user.role },
    });
    await createSession(user.id, response);
    return response;
  } catch (error) {
    console.error("Account sign-in failed.", error);
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}

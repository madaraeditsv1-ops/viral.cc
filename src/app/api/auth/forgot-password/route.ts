import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertEmailDeliveryConfigured, createAndSendAuthToken } from "@/lib/auth-email";
import { enforceRateLimit, requireSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });
const genericResponse = { message: "If an eligible account exists, a reset link will be sent shortly." };

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, "forgot-password");
  if (rateLimitError) return rateLimitError;

  let email: string;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    email = emailSchema.parse(JSON.parse(body) as unknown).email;
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    assertEmailDeliveryConfigured();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (user?.emailVerifiedAt) {
      try {
        await createAndSendAuthToken(user.id, user.email, "PASSWORD_RESET");
      } catch (error) {
        console.error("Password reset email delivery failed.", error);
      }
    }
    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Password reset request failed.", error);
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
}

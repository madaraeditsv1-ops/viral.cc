import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertEmailDeliveryConfigured, createAndSendAuthToken } from "@/lib/auth-email";
import { enforceRateLimit, requireSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  username: z.string().trim().min(2).max(40).optional(),
});

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, "register");
  if (rateLimitError) return rateLimitError;

  let input: z.infer<typeof credentialsSchema>;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    input = credentialsSchema.parse(JSON.parse(body) as unknown);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Enter a valid email address and a password of at least 12 characters." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    assertEmailDeliveryConfigured();
  } catch (error) {
    console.error("Account registration requires configured email delivery.", error);
    return NextResponse.json(
      { error: "Account registration is unavailable until email delivery is configured." },
      { status: 503 },
    );
  }

  const passwordHash = await hash(input.password, 12);
  let user: { id: string; email: string };
  try {
    user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        preferences: { create: { workspaceData: {} } },
        subscription: { create: {} },
      },
      select: { id: true, email: true },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Unable to create an account with those details." }, { status: 409 });
    }
    console.error("Account registration failed.", error);
    return NextResponse.json({ error: "Account registration is temporarily unavailable." }, { status: 503 });
  }

  try {
    await createAndSendAuthToken(user.id, user.email, "EMAIL_VERIFICATION");
  } catch (error) {
    console.error("Account was created but its verification email could not be delivered.", error);
    return NextResponse.json(
      { error: "Your account was created, but the verification email could not be sent. Request another link from the verification page." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { message: "Account created. Check your email for a verification link before signing in." },
    { status: 201 },
  );
}

import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, deleteCurrentSession, requireSameOrigin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    await deleteCurrentSession();
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Could not end the current session.", error);
    return NextResponse.json({ error: "Sign-out is temporarily unavailable." }, { status: 503 });
  }
}

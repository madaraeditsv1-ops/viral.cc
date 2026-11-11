import { connection, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  await connection();
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Could not read the current session.", error);
    return NextResponse.json({ error: "Session service is temporarily unavailable." }, { status: 503 });
  }
}

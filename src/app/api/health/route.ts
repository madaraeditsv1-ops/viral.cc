import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Health check could not reach the database.", error);
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}

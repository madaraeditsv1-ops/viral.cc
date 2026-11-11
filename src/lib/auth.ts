import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "viralflow_session";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

type RateLimitEntry = { count: number; resetAt: number };
const rateLimits = new Map<string, RateLimitEntry>();

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function newSessionExpiry() {
  return new Date(Date.now() + SESSION_LIFETIME_MS);
}

export function sessionTokenHash(token: string) {
  return hashToken(token);
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function createSession(userId: string, response: NextResponse) {
  const token = newSessionToken();
  const expiresAt = newSessionExpiry();

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  setSessionCookie(response, token, expiresAt);
}

export async function getAuthenticatedUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      user: {
        select: { id: true, email: true, username: true, image: true, role: true },
      },
      expiresAt: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export function requireSameOrigin(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const requestHost =
        request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
        request.headers.get("host");
      const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
      const requestProtocol = forwardedProtocol
        ? `${forwardedProtocol.replace(/:$/, "")}:`
        : request.nextUrl.protocol;
      const originUrl = new URL(origin);
      if (
        requestHost &&
        originUrl.host.toLowerCase() === requestHost.toLowerCase() &&
        originUrl.protocol === requestProtocol
      ) return null;
    } catch {
      return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
    }
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  return null;
}

export function enforceRateLimit(request: NextRequest, bucket: string) {
  const now = Date.now();
  for (const [key, value] of rateLimits) {
    if (value.resetAt <= now) rateLimits.delete(key);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const key = `${bucket}:${address}`;
  const current = rateLimits.get(key);
  const entry =
    !current || current.resetAt <= now
      ? { count: 1, resetAt: now + RATE_WINDOW_MS }
      : { ...current, count: current.count + 1 };
  rateLimits.set(key, entry);
  if (rateLimits.size > 10_000) {
    const oldestKey = rateLimits.keys().next().value;
    if (oldestKey) rateLimits.delete(oldestKey);
  }

  if (entry.count <= MAX_ATTEMPTS) return null;
  return NextResponse.json(
    { error: "Too many attempts. Please wait before trying again." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))) },
    },
  );
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}

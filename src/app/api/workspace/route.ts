import { Prisma } from "@prisma/client";
import { connection, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, getAuthenticatedUser, requireSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clipSchema = z.object({
  id: z.string().max(100),
  name: z.string().min(1).max(255),
  addedAt: z.string().datetime(),
  category: z.string().max(100),
  status: z.string().max(100),
  size: z.number().int().nonnegative().max(2_147_483_648),
  width: z.number().int().nonnegative().max(20_000),
  height: z.number().int().nonnegative().max(20_000),
  duration: z.number().nonnegative().max(86_400),
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day;
});

const postSchema = z.object({
  id: z.string().max(100),
  title: z.string().min(1).max(255),
  date: dateSchema,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  status: z.enum(["Draft", "Scheduled", "Published"]),
});

const analyticsSchema = z.object({
  id: z.string().max(100),
  date: dateSchema,
  postTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  views: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  likes: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  comments: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
  shares: z.number().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

const presetSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(200),
  resolution: z.string().min(1).max(50),
  fps: z.number().min(1).max(120),
  bitrate: z.string().min(1).max(50),
  codec: z.enum(["H.264", "H.265"]),
  format: z.enum(["MP4", "MOV"]),
  audioBitrate: z.string().max(50),
  audioSampleRate: z.string().max(50),
  color: z.string().max(50),
  profile: z.string().max(50),
  keyframeInterval: z.string().max(50),
});

const workspaceSchema = z.object({
  clips: z.array(clipSchema).max(500).optional(),
  posts: z.array(postSchema).max(2_000).optional(),
  analytics: z.array(analyticsSchema).max(20_000).optional(),
  presets: z.array(presetSchema).max(200).optional(),
  favorites: z.array(z.string().max(100)).max(200).optional(),
  profileName: z.string().max(40).optional(),
  timezone: z.string().max(80).optional(),
  contentCategory: z.string().max(100).optional(),
  preferredCategories: z.array(z.string().max(100)).max(100).optional(),
  audienceLocation: z.string().max(100).optional(),
  postingFrequency: z.string().max(100).optional(),
  editingSoftware: z.string().max(100).optional(),
  preferredContentStyle: z.string().max(200).optional(),
}).strict();

export async function GET() {
  await connection();
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Sign in to sync your workspace." }, { status: 401 });

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
      select: { workspaceData: true },
    });

    return NextResponse.json({ workspace: preferences?.workspaceData ?? null });
  } catch (error) {
    console.error("Could not load the account workspace.", error);
    return NextResponse.json({ error: "Workspace service is temporarily unavailable." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Sign in to sync your workspace." }, { status: 401 });

  const rateLimitError = enforceRateLimit(request, `workspace:${user.id}`);
  if (rateLimitError) return rateLimitError;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: "Workspace update exceeds the 1 MB limit." }, { status: 413 });
  }

  let parsedJson: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 1_000_000) {
      return NextResponse.json({ error: "Workspace update exceeds the 1 MB limit." }, { status: 413 });
    }
    parsedJson = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const result = workspaceSchema.safeParse(parsedJson);
  if (!result.success) {
    return NextResponse.json({ error: "Workspace data is invalid or exceeds a supported limit." }, { status: 400 });
  }

  try {
    const workspaceData = JSON.parse(JSON.stringify(result.data)) as Prisma.InputJsonValue;
    const preferences = {
      categories: result.data.preferredCategories,
      editingStyles: result.data.preferredContentStyle ? [result.data.preferredContentStyle] : [],
      timezone: result.data.timezone,
      audienceLocation: result.data.audienceLocation || null,
      postingFrequency: result.data.postingFrequency || null,
      editingSoftware: result.data.editingSoftware || null,
      preferredContentStyle: result.data.preferredContentStyle || null,
      workspaceData,
    };
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...preferences },
      update: preferences,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not save the account workspace.", error);
    return NextResponse.json({ error: "Workspace could not be saved." }, { status: 503 });
  }
}

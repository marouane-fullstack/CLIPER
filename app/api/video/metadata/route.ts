import prisma from "@/lib/prisma";
import { videoProcessingQueue } from "@/lib/queue";
import { isCloudinarySourceUrl, parseSecureHttpsUrl } from "@/lib/security/media";
import type { VideoService } from "@/lib/dashboard/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type MetadataBody = {
  originalUrl?: string;
  duration?: number;
  thumbnailUrl?: string;
  service?: VideoService | "mergeAI";
  language?: string;
};

const DEFAULT_SERVICE: VideoService = "captionAI";
const DEFAULT_LANGUAGE = "en";

function normalizeService(service: MetadataBody["service"]): VideoService {
  if (service === "mergeAI") return "captionClipAI";
  if (service === "clipAI" || service === "captionAI" || service === "captionClipAI") {
    return service;
  }
  return DEFAULT_SERVICE;
}

function extractErrorMessage(logs: unknown): string | null {
  if (!logs || typeof logs !== "object") return null;
  const record = logs as Record<string, unknown>;
  if (typeof record.error === "string" && record.error.trim().length > 0) {
    return record.error;
  }
  if (typeof record.message === "string" && record.message.trim().length > 0) {
    return record.message;
  }
  return null;
}

type CreditsSettlementResult = {
  settled: boolean;
  videoIncrement: number;
  clipIncrement: number;
};

function parseServiceFromRawTranscript(rawTranscript: unknown): VideoService {
  if (!rawTranscript || typeof rawTranscript !== "object") return DEFAULT_SERVICE;
  const record = rawTranscript as Record<string, unknown>;
  const service = record.requestedService;
  if (service === "captionAI" || service === "clipAI" || service === "captionClipAI") {
    return service;
  }
  return DEFAULT_SERVICE;
}

function getClipCreditsToCharge(service: VideoService, clipStatuses: string[]): number {
  if (service !== "clipAI" && service !== "captionClipAI") {
    return 0;
  }
  return clipStatuses.filter((status) => status === "uploaded").length;
}

async function settleCreditsForCompletedJob(params: {
  userId: string;
  videoId: string;
  processingStatus: "pending" | "processing" | "completed" | "error" | null;
  processingLogs: unknown;
  rawTranscript: unknown;
  clipStatuses: string[];
}): Promise<CreditsSettlementResult> {
  if (params.processingStatus !== "completed") {
    return { settled: false, videoIncrement: 0, clipIncrement: 0 };
  }

  if (extractErrorMessage(params.processingLogs)) {
    return { settled: false, videoIncrement: 0, clipIncrement: 0 };
  }

  const service = parseServiceFromRawTranscript(params.rawTranscript);
  const videoIncrement = 1;
  const clipIncrement = getClipCreditsToCharge(service, params.clipStatuses);
  const settledAtIso = new Date().toISOString();

  return prisma.$transaction(async (tx) => {
    const settlementMarkerResult = await tx.$executeRaw`
      UPDATE "ProcessingJob"
      SET "logs" = COALESCE("logs", '{}'::jsonb) || jsonb_build_object(
        '_creditsSettledAt', ${settledAtIso},
        '_creditsVideoIncrement', ${videoIncrement},
        '_creditsClipIncrement', ${clipIncrement}
      )
      WHERE "videoId" = ${params.videoId}
        AND "status" = 'completed'
        AND COALESCE("logs", '{}'::jsonb)->>'_creditsSettledAt' IS NULL
    `;

    if (!settlementMarkerResult) {
      return { settled: false, videoIncrement: 0, clipIncrement: 0 };
    }

    await tx.user.update({
      where: { id: params.userId },
      data: {
        monthlyVideosUsed: { increment: videoIncrement },
        monthlyClipsUsed: { increment: clipIncrement },
      },
    });

    return {
      settled: true,
      videoIncrement,
      clipIncrement,
    };
  });
}

function toUiStatus(params: {
  processingStatus: "pending" | "processing" | "completed" | "error" | null;
  videoStatus: string;
}): "queued" | "processing" | "done" | "failed" {
  if (params.processingStatus === "error") return "failed";
  if (params.processingStatus === "completed") return "done";
  if (params.processingStatus === "processing") return "processing";
  if (params.processingStatus === "pending") return "queued";

  if (params.videoStatus === "completed") return "done";
  return "processing";
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!videoProcessingQueue) {
      return NextResponse.json(
        {
          error:
            "Redis/BullMQ is not configured. Set REDIS_HOST and REDIS_PORT to enable processing.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as MetadataBody;
    const originalUrl = typeof body.originalUrl === "string" ? body.originalUrl : "";
    const duration =
      typeof body.duration === "number" && Number.isFinite(body.duration)
        ? Math.max(0, Math.round(body.duration))
        : 0;
    const thumbnailUrl =
      typeof body.thumbnailUrl === "string" && body.thumbnailUrl.length > 0
        ? body.thumbnailUrl
        : null;
    const service = normalizeService(body.service);
    const language =
      typeof body.language === "string" && body.language.trim().length > 0
        ? body.language.trim()
        : DEFAULT_LANGUAGE;

    if (!originalUrl) {
      return NextResponse.json(
        { error: "Missing originalUrl" },
        { status: 400 }
      );
    }

    const safeOriginalUrl = parseSecureHttpsUrl(originalUrl);
    if (!safeOriginalUrl) {
      return NextResponse.json(
        { error: "Invalid originalUrl. HTTPS and public host are required." },
        { status: 400 }
      );
    }

    if (!isCloudinarySourceUrl(safeOriginalUrl.toString())) {
      return NextResponse.json(
        { error: "Only Cloudinary video URLs are supported." },
        { status: 400 }
      );
    }

    const safeThumbnailUrl =
      thumbnailUrl && parseSecureHttpsUrl(thumbnailUrl)
        ? parseSecureHttpsUrl(thumbnailUrl)?.toString() ?? null
        : null;

    const video = await prisma.video.create({
      data: {
        userId,
        originalUrl: safeOriginalUrl.toString(),
        thumbnailUrl: safeThumbnailUrl,
        duration,
        rawTranscript: {
          requestedService: service,
          language,
        },
        status: "uploaded",
        updatedAt: new Date(),
      },
    });

    const job = await prisma.processingJob.create({
      data: {
        videoId: video.id,
        status: "pending",
        stage: "extracting_audio",
      },
    });

    await videoProcessingQueue.add("process-video", {
      videoId: video.id,
      service,
      language,
    });

    return NextResponse.json({
      success: true,
      video,
      processingJob: job,
      queued: true,
    });
  } catch (error) {
    console.error("Metadata error:", error);
    return NextResponse.json(
      { error: "Failed to save metadata" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = req.nextUrl.searchParams.get("videoId")?.trim();
    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const video = await prisma.video.findFirst({
      where: { id: videoId, userId },
      select: {
        id: true,
        status: true,
        rawTranscript: true,
        ProcessingJob: {
          select: {
            status: true,
            stage: true,
            logs: true,
          },
        },
        Clip: {
          select: { status: true },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const processingStatus = video.ProcessingJob?.status ?? null;
    const uiStatus = toUiStatus({ processingStatus, videoStatus: video.status });
    const logsMessage = extractErrorMessage(video.ProcessingJob?.logs ?? null);
    const creditSettlement = await settleCreditsForCompletedJob({
      userId,
      videoId: video.id,
      processingStatus,
      processingLogs: video.ProcessingJob?.logs ?? null,
      rawTranscript: video.rawTranscript,
      clipStatuses: video.Clip.map((clip) => clip.status),
    });
    let message = "Processing";
    if (uiStatus === "failed") {
      message = logsMessage ?? "Processing failed. Please try again with another video.";
    } else if (uiStatus === "queued") {
      message = "Queued";
    } else if (uiStatus === "done") {
      message = "Done";
    }

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        status: video.status,
        service: parseServiceFromRawTranscript(video.rawTranscript),
      },
      processingJob: video.ProcessingJob
        ? {
            status: video.ProcessingJob.status,
            stage: video.ProcessingJob.stage,
            logs: video.ProcessingJob.logs,
          }
        : null,
      clips: {
        count: video.Clip.length,
        readyCount: video.Clip.filter((clip) => clip.status === "uploaded").length,
      },
      credits: creditSettlement,
      uiStatus,
      message,
    });
  } catch (error) {
    console.error("Video status error:", error);
    return NextResponse.json({ error: "Failed to load video status" }, { status: 500 });
  }
}
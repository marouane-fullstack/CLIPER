import Link from 'next/link'
import type { ReactNode } from 'react'
import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatStatusLabel, getSafeClipPreviewUrl, toSafeHttpsUrlString } from '@/lib/security/media'
import type { VideoService } from '@/lib/dashboard/types'

type PageProps = {
  params: Promise<{ projectId: string }>
}

function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const remaining = total % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

function parseRequestedService(rawTranscript: unknown): VideoService {
  if (!rawTranscript || typeof rawTranscript !== 'object') return 'captionAI'
  const service = (rawTranscript as Record<string, unknown>).requestedService
  if (service === 'captionAI' || service === 'clipAI' || service === 'captionClipAI') {
    return service
  }
  return 'captionAI'
}

function processingErrorFromLogs(logs: unknown): string | null {
  if (!logs || typeof logs !== 'object') return null
  const message = (logs as Record<string, unknown>).message
  const error = (logs as Record<string, unknown>).error
  if (typeof error === 'string' && error.length > 0) return error
  if (typeof message === 'string' && message.length > 0) return message
  return null
}

function toUiStatus(processingStatus: 'pending' | 'processing' | 'completed' | 'error' | null) {
  if (processingStatus === 'error') return 'failed'
  if (processingStatus === 'completed') return 'done'
  if (processingStatus === 'processing') return 'processing'
  return 'queued'
}

type ProjectClip = {
  id: string
  startTime: number
  endTime: number
  status: string
  cloudinaryUrl: string | null
  reason: string | null
  createdAt: Date
}

function renderProjectResult(requestedService: VideoService, uiStatus: string, clips: ProjectClip[]): ReactNode {
  const captionOutputClip = clips.find((clip) => clip.status === 'uploaded') ?? null
  const captionOutputUrl = captionOutputClip ? getSafeClipPreviewUrl(captionOutputClip.cloudinaryUrl) : null

  if (requestedService === 'captionAI') {
    if (captionOutputClip) {
      return (
        <article className="rounded border border-white/10 bg-black overflow-hidden max-w-3xl">
          <div className="aspect-video bg-black/70">
            {captionOutputUrl ? (
              <video className="h-full w-full" src={captionOutputUrl} preload="metadata" controls playsInline>
                <track
                  kind="captions"
                  src="data:text/vtt;charset=utf-8,WEBVTT"
                  srcLang="en"
                  label="English captions"
                />
              </video>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-white/60">
                Captioned video unavailable
              </div>
            )}
          </div>
          <div className="p-3 text-xs text-white/70">Captioned full-video output</div>
        </article>
      )
    }

    return (
      <div className="rounded border border-white/10 p-10 text-center text-white/60">
        {uiStatus === 'done' ? 'Captioned output is not ready yet.' : 'Video is still processing. Refresh in a moment.'}
      </div>
    )
  }

  if (clips.length === 0) {
    const emptyStateMessage =
      uiStatus === 'failed' ? 'No clips could be generated for this video.' : 'No clips found for this video yet.'

    return <div className="rounded border border-white/10 p-10 text-center text-white/60">{emptyStateMessage}</div>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clips.slice(0, 3).map((clip) => {
        const safeClipUrl = getSafeClipPreviewUrl(clip.cloudinaryUrl)
        const clipLength = Math.max(0, clip.endTime - clip.startTime)

        return (
          <article key={clip.id} className="rounded border border-white/10 bg-black overflow-hidden">
            <div className="aspect-video bg-black/70">
              {safeClipUrl ? (
                <video className="h-full w-full" src={safeClipUrl} preload="metadata" controls playsInline>
                  <track
                    kind="captions"
                    src="data:text/vtt;charset=utf-8,WEBVTT"
                    srcLang="en"
                    label="English captions"
                  />
                </video>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-white/60">
                  Clip video unavailable
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              <p className="text-sm font-semibold truncate">Clip #{clip.id.slice(0, 8)}</p>
              <p className="text-xs text-white/70">
                Range: {formatSeconds(clip.startTime)} → {formatSeconds(clip.endTime)} ({formatSeconds(clipLength)})
              </p>
              <p className="text-xs text-white/70">Status: {formatStatusLabel(clip.status)}</p>
              {clip.reason ? <p className="text-xs text-white/60 line-clamp-2">{clip.reason}</p> : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default async function ProjectClipsPage({ params }: Readonly<PageProps>) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { projectId } = await params

  const project = await prisma.video.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      rawTranscript: true,
      createdAt: true,
      ProcessingJob: {
        select: {
          status: true,
          stage: true,
          logs: true,
        },
      },
      Clip: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          cloudinaryUrl: true,
          reason: true,
          createdAt: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const safeSourceUrl = toSafeHttpsUrlString(project.originalUrl)
  const requestedService = parseRequestedService(project.rawTranscript)
  const processingStatus = project.ProcessingJob?.status ?? 'pending'
  const processingMessage = processingErrorFromLogs(project.ProcessingJob?.logs)
  const uiStatus = toUiStatus(processingStatus)
  const resultContent = renderProjectResult(requestedService, uiStatus, project.Clip)

  return (
    <div className="w-full py-5 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Result</h1>
          <p className="text-sm text-white/60">
            Service: {requestedService} · Status: {formatStatusLabel(uiStatus)}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-3 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-white/90"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="rounded border border-white/10 p-4 bg-black/40">
        <p className="text-sm text-white/70">
          Source URL:{' '}
          {safeSourceUrl ? (
            <a
              href={safeSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Open source video
            </a>
          ) : (
            <span className="text-white/50">Unavailable</span>
          )}
        </p>
      </div>

      {uiStatus === 'failed' && (
        <div className="rounded border border-red-500/40 p-4 bg-red-500/10 text-sm text-red-100">
          {processingMessage ??
            'Processing failed. If this is a YouTube video, try another link. For clip generation, make sure duration is enough for 3 clips.'}
        </div>
      )}

      {resultContent}
    </div>
  )
}

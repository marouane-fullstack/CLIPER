import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatStatusLabel, getSafeClipPreviewUrl } from '@/lib/security/media'

export default async function ClipsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const clips = await prisma.clip.findMany({
    where: {
      Video: { userId },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      videoId: true,
      cloudinaryUrl: true,
      status: true,
      startTime: true,
      endTime: true,
      createdAt: true,
    },
  })

  return (
    <div className="w-full py-5 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Clips</h1>
          <p className="text-sm text-white/60">{clips.length} total clips</p>
        </div>
        <Link
          href="/dashboard"
          className="px-3 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-white/90"
        >
          Back to dashboard
        </Link>
      </div>

      {clips.length === 0 ? (
        <div className="rounded border border-white/10 p-10 text-center text-white/60">No clips found yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clips.map((clip) => {
            const safeClipUrl = getSafeClipPreviewUrl(clip.cloudinaryUrl)
            const clipDuration = Math.max(0, Math.floor(clip.endTime - clip.startTime))

            return (
              <Link
                key={clip.id}
                href={`/dashboard/projects/${clip.videoId}`}
                className="group block bg-black rounded overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video bg-gray-900">
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
                    <div className="h-full w-full flex items-center justify-center text-white text-sm">
                      Video cannot be displayed
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold truncate">Clip #{clip.id.slice(0, 8)}</p>
                  <p className="text-xs text-white/60">Duration: {clipDuration}s</p>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-white/80">{formatStatusLabel(clip.status)}</span>
                    <span className="text-white/50">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(clip.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

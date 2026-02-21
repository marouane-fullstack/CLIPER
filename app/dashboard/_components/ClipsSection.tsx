'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useDashboardClips } from '@/lib/store/dashboard-store'
import { formatStatusLabel, getSafeClipPreviewUrl } from '@/lib/security/media'

export default function ClipsSection() {
  const clips = useDashboardClips()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clips</h2>
        <Link href="/dashboard/clips">
          <Button variant="outline" className="flex items-center gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clips.map((clip) => {
          const safeUrl = getSafeClipPreviewUrl(clip.cloudinaryUrl)

          return (
            <Link
              key={clip.id}
              href={`/dashboard/projects/${clip.videoId}`}
              className="group block bg-black rounded overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video bg-gray-900">
                {safeUrl ? (
                  <video className="h-full w-full" src={safeUrl} preload="metadata" controls playsInline>
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

              <div className="p-3">
                <h4 className="text-sm font-semibold line-clamp-2 mb-2">Clip #{clip.id.slice(0, 8)}</h4>
                <div className="flex items-center justify-between">
                  <Badge variant={clip.status === 'uploaded' ? 'default' : 'secondary'} className="text-xs">
                    {formatStatusLabel(clip.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(clip.createdAt))}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}

        {clips.length === 0 && <p className="text-white/60 col-span-full text-center py-10">No recent clips found.</p>}
      </div>
    </div>
  )
}

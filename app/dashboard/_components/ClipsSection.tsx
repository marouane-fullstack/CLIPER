'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeDisplay,
} from "@/components/kibo-ui/video-player"

// Example: your clip data could come from props or an API
import { mockRecentClipsLo } from '@/lib/mock-data'

function isRawVideo(url: string) {
  return /\.(mp4|webm|ogg)$/.test(url) || url.includes("res.cloudinary.com")
}

export default function ClipsSection() {
  const projectClips = mockRecentClipsLo

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clips</h2>
        <Link href="/clips">
          <Button variant="outline" className="flex items-center gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Clips Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projectClips.map((clip) => (
          <Link
            key={clip.id}
            href={`/clip/${clip.id}`}
            className="group block bg-black rounded overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
          >
            {/* Video */}
            <div className="relative aspect-video bg-gray-900">
              {isRawVideo(clip.cloudinaryUrl || clip.thumbnail) ? (
                <VideoPlayer className="h-full w-full">
                  <VideoPlayerContent
                    crossOrigin=""
                    muted
                    preload="auto"
                    autoPlay={false}
                    controls
                    src={clip.cloudinaryUrl || clip.thumbnail}
                  />
                  <VideoPlayerControlBar>
                    <VideoPlayerPlayButton />
                    <VideoPlayerTimeDisplay showDuration />
                  </VideoPlayerControlBar>
                </VideoPlayer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-sm">
                  Video cannot be displayed
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="text-sm font-semibold line-clamp-2 mb-2">{clip.name}</h4>
              <div className="flex items-center justify-between">
                <Badge
                  variant={clip.status === 'uploaded' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {clip.status === 'uploaded' && '✓'}
                  {clip.status === 'processing' && '⟳'}
                  {clip.status === 'pending' && '⏱'}
                  {clip.status === 'error' && '✕'}
                </Badge>
                {clip.progress && clip.progress > 0 && clip.progress < 100 && (
                  <span className="text-xs text-muted-foreground">{clip.progress}%</span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {projectClips.length === 0 && (
          <p className="text-white/60 col-span-full text-center py-10">
            No clips found for this project.
          </p>
        )}
      </div>
    </div>
  )
}
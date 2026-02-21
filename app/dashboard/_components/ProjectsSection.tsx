'use client'

import Link from 'next/link'
import { useDashboardProjects } from '@/lib/store/dashboard-store'
import { formatStatusLabel, parseProjectMedia, titleFromUrl } from '@/lib/security/media'

function ProjectMedia({ originalUrl }: Readonly<{ originalUrl: string }>) {
  const media = parseProjectMedia(originalUrl)
  const mediaTitle = titleFromUrl(originalUrl)

  if (media.kind === 'youtube' || media.kind === 'vimeo') {
    return (
      <iframe
        className="h-full w-full"
        src={media.src}
        title={mediaTitle}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (media.kind === 'video') {
    return (
      <video className="h-full w-full" src={media.src} preload="metadata" controls playsInline>
        <track
          kind="captions"
          src="data:text/vtt;charset=utf-8,WEBVTT"
          srcLang="en"
          label="English captions"
        />
      </video>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center text-white/70 text-sm">
      Preview unavailable for this URL
    </div>
  )
}

export default function ProjectsSection() {
  const projects = useDashboardProjects()

  return (
    <div className="flex flex-col gap-6 w-full py-5">
      <h3 className="text-2xl font-bold">All Projects ({projects.length})</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group overflow-hidden bg-black border border-white/10 hover:border-white/20 transition relative rounded"
          >
            <div className="relative aspect-video bg-black">
              <ProjectMedia originalUrl={project.originalUrl} />
            </div>

            <div className="p-3 flex items-center justify-between gap-2">
              <p className="font-semibold truncate">{titleFromUrl(project.originalUrl)}</p>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="px-3 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-white/90 whitespace-nowrap"
              >
                View clips
              </Link>
            </div>

            <div className="px-3 pb-3 flex items-center justify-between gap-2 text-sm text-white/60">
              <p>{formatStatusLabel(project.status)}</p>
              <p>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(project.createdAt))}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

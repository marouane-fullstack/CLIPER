import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import WordMark from './_components/wordMark'
import ProjectsSection from '@/app/dashboard/_components/ProjectsSection'
import Uploader from './_components/Uploader'
import ClipsSection from '@/app/dashboard/_components/ClipsSection'
import DashboardStoreHydrator from '@/app/dashboard/_components/DashboardStoreHydrator'
import prisma from '@/lib/prisma'
import type { DashboardClip, DashboardProject, VideoService } from '@/lib/dashboard/types'

function parseRequestedService(rawTranscript: unknown): VideoService {
  if (!rawTranscript || typeof rawTranscript !== 'object') return 'captionAI'
  const service = (rawTranscript as Record<string, unknown>).requestedService
  if (service === 'captionAI' || service === 'clipAI' || service === 'captionClipAI') {
    return service
  }
  return 'captionAI'
}

async function getProjectsForUser(userId: string): Promise<DashboardProject[]> {
  const projects = await prisma.video.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      rawTranscript: true,
      createdAt: true,
    },
  })

  return projects.map((project) => ({
    id: project.id,
    originalUrl: project.originalUrl,
    status: project.status,
    service: parseRequestedService(project.rawTranscript),
    createdAt: project.createdAt.toISOString(),
  }))
}

async function getLatestClipsForUser(userId: string): Promise<DashboardClip[]> {
  const clips = await prisma.clip.findMany({
    where: {
      Video: { userId },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      videoId: true,
      cloudinaryUrl: true,
      status: true,
      createdAt: true,
    },
  })

  return clips.map((clip) => ({
    ...clip,
    createdAt: clip.createdAt.toISOString(),
  }))
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const [user, projects, clips] = await Promise.all([
    currentUser(),
    getProjectsForUser(userId),
    getLatestClipsForUser(userId),
  ])

  const fullName = user?.fullName?.toUpperCase()
  const fallbackName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').toUpperCase()

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 overflow-auto">
        <div className="sm:p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-destructive">{fullName || fallbackName || 'CREATOR'}</span>!
            </h1>
            <Uploader />
            <WordMark />
          </div>

          <DashboardStoreHydrator data={{ projects, clips }} />

          <ProjectsSection />

          <ClipsSection />
        </div>
      </main>
    </div>
  )
}

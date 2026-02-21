export const VIDEO_SERVICE_VALUES = ['captionAI', 'clipAI', 'captionClipAI'] as const

export type VideoService = (typeof VIDEO_SERVICE_VALUES)[number]

export type JobUiStatus = 'queued' | 'processing' | 'done' | 'failed'

export type DashboardProject = {
  id: string
  originalUrl: string
  status: string
  createdAt: string
  service?: VideoService
}

export type DashboardClip = {
  id: string
  videoId: string
  cloudinaryUrl: string | null
  status: string
  createdAt: string
}

export type DashboardBootstrapData = {
  projects: DashboardProject[]
  clips: DashboardClip[]
}

export type DashboardUserSummary = {
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  imageUrl: string | null
  plan: 'free' | 'pro' | 'enterprise'
  monthlyVideosUsed: number
  monthlyClipsUsed: number
  videoLimit: number
  clipLimit: number
}

export type VideoMetadataRequest = {
  originalUrl: string
  duration: number
  service: VideoService
  language?: string
  thumbnailUrl?: string
}

export type VideoMetadataResponse = {
  success: boolean
  queued: boolean
  video: {
    id: string
    originalUrl: string
    status: string
    createdAt: string
  }
  processingJob: {
    id: string
    status: string
    stage: string
  }
}

export type VideoStatusResponse = {
  success: boolean
  video: {
    id: string
    status: string
    service: VideoService
  }
  processingJob: {
    status: 'pending' | 'processing' | 'completed' | 'error'
    stage: string
    logs: unknown
  } | null
  clips: {
    count: number
    readyCount: number
  }
  credits: {
    settled: boolean
    videoIncrement: number
    clipIncrement: number
  }
  uiStatus: JobUiStatus
  message: string
}

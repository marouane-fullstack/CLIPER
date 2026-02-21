'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileVideo, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useDashboardStore } from '@/lib/store/dashboard-store'
import {
  type DashboardProject,
  type VideoMetadataRequest,
  type VideoMetadataResponse,
  type VideoService,
  type VideoStatusResponse,
  type JobUiStatus,
} from '@/lib/dashboard/types'

const MAX_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_DURATION = 15 * 60 // 15 minutes (seconds)
const MIN_DURATION_FOR_THREE_SHORTS = 3 * 60 // 3 clips x max 60s

type SignatureResponse = {
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  folder?: string
  publicId?: string | null
}

type CloudinaryVideoUploadResponse = {
  secure_url?: string
  duration?: number
  error?: { message?: string }
}

type MetadataErrorResponse = {
  error?: string
}

function needsThreeShorts(service: VideoService): boolean {
  return service === 'clipAI' || service === 'captionClipAI'
}

function getUploadValidationError(fileDuration: number | null, service: VideoService): string | null {
  if (fileDuration === null) {
    return 'Upload a video file first'
  }

  if (needsThreeShorts(service) && fileDuration < MIN_DURATION_FOR_THREE_SHORTS) {
    return 'Insufficient duration: at least 3 minutes is required to generate 3 clips.'
  }

  return null
}

async function resolveSource(params: {
  file: File
  service: VideoService
  setUploadProgress: (value: number | null) => void
}): Promise<{ originalUrl: string; duration: number }> {
  const result = await uploadVideoToCloudinaryDirect(params.file, 'videos', {
    onProgress: (percent) => params.setUploadProgress(percent),
  })

  const duration = Math.round(result.duration)
  if (needsThreeShorts(params.service) && duration < MIN_DURATION_FOR_THREE_SHORTS) {
    throw new Error('Insufficient duration: at least 3 minutes is required to generate 3 clips.')
  }

  return { originalUrl: result.secureUrl, duration }
}

async function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(Number.isFinite(video.duration) ? video.duration : null)
    }

    video.onerror = () => resolve(null)
    video.src = URL.createObjectURL(file)
  })
}

function assertSingleVideoFile(fileList: File[]): File {
  if (fileList.length !== 1) {
    throw new Error('Only one video file is allowed')
  }
  const file = fileList[0]
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 500MB.')
  }
  return file
}

async function fetchUploadSignature(folder: string): Promise<SignatureResponse> {
  const sigRes = await fetch(`/api/video/signature?folder=${encodeURIComponent(folder)}`)
  const sigJson = (await sigRes.json()) as Partial<SignatureResponse> & { error?: string }
  if (!sigRes.ok) {
    throw new Error(sigJson?.error || 'Failed to get upload signature')
  }
  if (!sigJson.timestamp || !sigJson.signature || !sigJson.apiKey || !sigJson.cloudName) {
    throw new Error('Signature endpoint returned incomplete data')
  }
  return sigJson as SignatureResponse
}

async function uploadVideoToCloudinaryDirect(
  file: File,
  folder: string,
  options?: { onProgress?: (percent: number) => void }
) {
  const { timestamp, signature, apiKey, cloudName } = await fetchUploadSignature(folder)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('folder', folder)

  options?.onProgress?.(0)

  const data = await new Promise<CloudinaryVideoUploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)

    xhr.upload.onprogress = (event) => {
      if (!options?.onProgress) return
      if (!event.lengthComputable) return
      const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)))
      options.onProgress(percent)
    }

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText) as CloudinaryVideoUploadResponse
        if (xhr.status >= 200 && xhr.status < 300) {
          options?.onProgress?.(100)
          resolve(json)
          return
        }
        reject(new Error(json?.error?.message || 'Cloudinary upload failed'))
      } catch {
        reject(new Error('Cloudinary upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error while uploading to Cloudinary'))
    xhr.send(formData)
  })

  if (!data.secure_url) throw new Error('Cloudinary upload succeeded but returned no URL')
  return { secureUrl: data.secure_url, duration: data.duration ?? 0 }
}

async function saveVideoMetadata(payload: VideoMetadataRequest) {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), 30_000)

  const metaRes = await fetch('/api/video/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).finally(() => globalThis.clearTimeout(timeoutId))

  const metaJson = (await metaRes.json()) as VideoMetadataResponse & MetadataErrorResponse
  if (!metaRes.ok) {
    throw new Error(metaJson?.error || 'Metadata save failed')
  }

  return metaJson as VideoMetadataResponse
}

export default function Uploader() {
  const [files, setFiles] = useState<File[]>([])
  const [fileDuration, setFileDuration] = useState<number | null>(null)
  const [service, setService] = useState<VideoService>('captionAI')
  const [language, setLanguage] = useState('')
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [jobUiStatus, setJobUiStatus] = useState<JobUiStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [stage, setStage] = useState<'idle' | 'uploading' | 'finalizing'>('idle')
  const [uploadStartedAt, setUploadStartedAt] = useState<number | null>(null)
  const prependProject = useDashboardStore((state) => state.prependProject)
  const updateProjectStatus = useDashboardStore((state) => state.updateProjectStatus)

  const hasFile = files.length === 1

  const uploadEta = (() => {
    if (!uploadStartedAt || uploadProgress === null || uploadProgress <= 0 || uploadProgress >= 100) {
      return null
    }
    const elapsedSeconds = (Date.now() - uploadStartedAt) / 1000
    const estimatedTotal = elapsedSeconds / (uploadProgress / 100)
    const left = Math.max(0, Math.round(estimatedTotal - elapsedSeconds))
    return left
  })()

  let submitButtonText = service === 'captionAI' ? 'Generate captioned video' : 'Generate clips'
  if (loading) {
    submitButtonText = stage === 'finalizing' ? 'Finalizing…' : 'Uploading…'
  }

  useEffect(() => {
    if (!activeVideoId) return

    let cancelled = false
    let lastStatus: JobUiStatus | null = null

    const pollStatus = async () => {
      try {
        const statusRes = await fetch(`/api/video/metadata?videoId=${encodeURIComponent(activeVideoId)}`)
        const statusJson = (await statusRes.json()) as VideoStatusResponse & MetadataErrorResponse

        if (!statusRes.ok) {
          throw new Error(statusJson.error || 'Failed to fetch processing status')
        }

        if (cancelled) return

        setJobUiStatus(statusJson.uiStatus)
        updateProjectStatus(activeVideoId, statusJson.uiStatus, statusJson.video.service)

        if (statusJson.uiStatus !== lastStatus) {
          if (statusJson.uiStatus === 'failed') {
            toast.error(statusJson.message || 'Processing failed')
            setActiveVideoId(null)
          }
          if (statusJson.uiStatus === 'done') {
            toast.success('Processing completed')
            setActiveVideoId(null)
          }
        }

        lastStatus = statusJson.uiStatus
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Failed to fetch processing status'
        toast.error(message)
        setActiveVideoId(null)
      }
    }

    void pollStatus()
    const intervalId = globalThis.setInterval(() => {
      void pollStatus()
    }, 5000)

    return () => {
      cancelled = true
      globalThis.clearInterval(intervalId)
    }
  }, [activeVideoId, updateProjectStatus])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    void (async () => {
      try {
        const file = assertSingleVideoFile(acceptedFiles)

        const duration = await readVideoDuration(file)
        if (duration === null) {
          toast.error('Failed to read video duration')
          return
        }

        if (duration > MAX_DURATION) {
          toast.error('Video too long. Maximum duration is 15 minutes')
          return
        }

        if (needsThreeShorts(service) && duration < MIN_DURATION_FOR_THREE_SHORTS) {
          toast.error('Video duration is too short for 3 clips. Use at least 3 minutes.')
          return
        }

        setFiles([file])
        setFileDuration(duration)
        toast.success('Video file ready')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid file'
        toast.error(message)
      }
    })()
  }, [service])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    noClick: true,
    multiple: false,
    maxFiles: 1,
  })

  const handleSubmit = async () => {
    const validationError = getUploadValidationError(fileDuration, service)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const file = files[0]
    if (!file) {
      toast.error('Upload a video file first')
      return
    }

    let toastId: string | number | undefined

    try {
      setLoading(true)
      setUploadProgress(null)
      setStage('uploading')
      setUploadStartedAt(Date.now())

      toastId = toast.loading('Uploading video…')

      const source = await resolveSource({
        file,
        service,
        setUploadProgress,
      })

      setStage('finalizing')
      setUploadProgress(null)
      toast.loading('Finalizing…', { id: toastId })

      const payload: VideoMetadataRequest = {
        originalUrl: source.originalUrl,
        duration: source.duration,
        service,
      }
      if (language.trim().length > 0) {
        payload.language = language.trim()
      }

      const metadata = await saveVideoMetadata(payload)

      if (metadata.video) {
        const nextProject: DashboardProject = {
          id: metadata.video.id,
          originalUrl: metadata.video.originalUrl,
          status: 'queued',
          service,
          createdAt: new Date(metadata.video.createdAt).toISOString(),
        }
        prependProject(nextProject)
        updateProjectStatus(metadata.video.id, 'queued', service)
        setActiveVideoId(metadata.video.id)
        setJobUiStatus('queued')
      }

      toast.success('Uploaded. Processing started.', { id: toastId })
      setFiles([])
      setFileDuration(null)
    } catch (err) {
      let message = 'Something went wrong'
      if (err instanceof DOMException && err.name === 'AbortError') {
        message = 'Timed out while saving. Please try again.'
      } else if (err instanceof Error) {
        message = err.message
      }
      if (toastId === undefined) {
        toast.error(message)
        return
      }
      toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
      setUploadProgress(null)
      setStage('idle')
      setUploadStartedAt(null)
    }
  }

  return (
    <div className="min-h-fit bg-background flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl md:text-5xl font-bold orbitron mb-8 tracking-tight">
        NueSpring
      </h1>

      <div
        {...getRootProps()}
        className={cn(
          'w-full max-w-2xl bg-background border border-border/30 rounded-2xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden',
          isDragActive ? 'ring-2 ring-primary/60 bg-primary/10' : ''
        )}
      >
        <input {...getInputProps()} className="hidden" />

        {isDragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary animate-bounce" />
              <p className="text-xl font-medium">Drop video file here</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Drag a file (mp4, mov, webm) here, Video up to 500MB, maximum duration of 15 minutes
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          <div className="mx-auto w-fit rounded-md bg-muted text-foreground/80 px-3 py-1 text-sm">
            Upload only: video file to Cloudinary.
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-sm text-foreground/70">
              <span>Service</span>
              <select
                className="mt-2 w-full bg-background border border-border/60 h-11 px-3 rounded-xl text-base"
                value={service}
                onChange={(event) => setService(event.target.value as VideoService)}
                onClick={(event) => event.stopPropagation()}
              >
                <option value="captionAI">captionAI (caption full video)</option>
                <option value="clipAI">clipAI (3 viral clips)</option>
                <option value="captionClipAI">captionClipAI (3 clips + captions)</option>
              </select>
            </label>

            <label className="text-sm text-foreground/70">
              <span>Language (optional)</span>
              <Input
                type="text"
                placeholder="en"
                className="mt-2 h-11 rounded-xl"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </label>
          </div>

          <div className="flex items-center gap-6">
            <Button
              type="button"
              variant="ghost"
              className="flex rounded-[5px] items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-base font-semibold group p-0"
              onClick={(e) => {
                e.stopPropagation()
                open()
              }}
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Upload
            </Button>
          </div>

          {hasFile && (
            <div className="border border-border/40 rounded-[10px] p-4 flex items-center gap-3">
              <FileVideo className="text-foreground/70 w-5 h-5" />
              <span className="text-2xl truncate flex-1 text-foreground/80">{files[0].name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFiles([])
                  setFileDuration(null)
                  toast.info('File removed')
                }}
                className="text-base text-foreground/80 underline underline-offset-4 hover:text-foreground"
              >
                Remove
              </button>
            </div>
          )}

          {activeVideoId && jobUiStatus && (
            <div className="text-sm text-foreground/70 rounded-md border border-border/40 px-3 py-2">
              Processing status: {jobUiStatus}
            </div>
          )}

          {hasFile && stage === 'uploading' && uploadProgress !== null && (
            <div className="flex items-center justify-between text-2xl px-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <LoaderCircle className="w-5 h-5 animate-spin" />
                <span>Uploading {uploadProgress.toFixed(1)} %</span>
              </div>
              <span className="text-foreground/80 text-2xl">
                {uploadEta === null ? 'Calculating...' : `${uploadEta} seconds left`}
              </span>
              <span className="text-foreground text-2xl">Cancel</span>
            </div>
          )}

          <Button
            className="w-full bg-primary z-50 hover:bg-primary/80 h-14 rounded-xl text-lg font-bold"
            onClick={(e) => {
              e.stopPropagation()
              handleSubmit()
            }}
            disabled={loading}
          >
            {submitButtonText}
          </Button>
        </div>
      </div>
    </div>
  )
}
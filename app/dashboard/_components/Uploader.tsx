'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link as LinkIcon, FileVideo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'

const MAX_SIZE = 500 * 1024 * 1024 // 500MB
const MAX_DURATION = 15 * 60 // 15 minutes (seconds)

export default function Uploader() {
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const hasFile = files.length === 1
  const hasUrl = url.trim().length > 0

  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration <= MAX_DURATION)
      }

      video.onerror = () => resolve(false)
      video.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) {
      toast.error('Only one video file is allowed')
      return
    }

    const file = acceptedFiles[0]

    if (file.size > MAX_SIZE) {
      toast.error('File too large. Maximum size is 500MB.')
      return
    }

    const validDuration = await validateVideoDuration(file)
    if (!validDuration) {
      toast.error('Video too long. Maximum duration is 15 minutes.')
      return
    }

    setFiles([file]) // overwrite, never append
    setUrl('')
    toast.success('Video file ready')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    noClick: true,
    disabled: hasUrl,
    multiple: false,
    maxFiles: 1,
  })

  return (
    <div className="min-h-fit bg-background flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl md:text-5xl font-bold orbitron mb-8 tracking-tight">
        NueSpring
      </h1>

      <div
        {...getRootProps()}
        className={cn(
          'w-full max-w-xl bg-background border dark:border-foreground border-border/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden',
          isDragActive && !hasUrl ? 'ring-2 ring-purple-500 bg-primary/20' : '',
          hasUrl ? 'opacity-80 cursor-not-allowed' : ''
        )}
      >
        <input {...getInputProps()} className="hidden" />

        {isDragActive && !hasUrl && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-bounce" />
              <p className="text-xl font-medium">Drop video file here</p>
              <p className="text-xl font-medium text-accent-foreground">
                video file up to 500MB, maximum duration of 15 minutes
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 relative z-10">
          {/* URL INPUT */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-foreground/80 transition-colors">
              <LinkIcon className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Drop a Zoom link"
              disabled={hasFile}
              className="w-full bg-background border-border h-14 pl-12 pr-4 rounded-[5px] text-lg placeholder:text-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (files.length) setFiles([])
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* UPLOAD BUTTON */}
          <div className="flex items-center gap-6">
            <Button
              type="button"
              variant="ghost"
              disabled={hasUrl}
              className="flex rounded-[5px] items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed group"
              onClick={(e) => {
                e.stopPropagation()
                if (hasUrl) return
                const input = document.querySelector(
                  'input[type="file"]'
                ) as HTMLInputElement
                input?.click()
              }}
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Upload
            </Button>
          </div>

          {/* FILE DISPLAY */}
          {hasFile && (
            <div className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
              <FileVideo className="text-purple-400 w-5 h-5" />
              <span className="text-sm truncate flex-1">
                {files[0].name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setFiles([])
                  toast.info('File removed')
                }}
                className="text-foreground/40 text-xl hover:text-foreground"
              >
                ×
              </button>
            </div>
          )}

          {/* MAIN CTA */}
          <Button
            className="w-full bg-primary z-50 hover:bg-primary/80 h-14 rounded-[5px] text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform"
            onClick={(e) => {
              e.stopPropagation()
              if (!hasFile && !hasUrl) {
                toast.error('Upload a file or provide a link first')
                return
              }
              toast.success('Processing started')
            }}
          >
            Get clips in 1 click
          </Button>

          {/* FOOTER */}
          <div className="text-center pt-2">
            <Link
              href="#"
              className="text-foreground/40 underline-offset-4 hover:text-foreground transition-all text-xs"
            >
              Click here to try a sample project
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
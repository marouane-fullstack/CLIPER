type ParsedMedia =
  | { kind: 'youtube'; src: string }
  | { kind: 'vimeo'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'unsupported' }

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'])
const TRUSTED_VIDEO_HOSTS = new Set(['res.cloudinary.com'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.mov'])

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase()

  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return true
  }

  if (host.startsWith('10.') || host.startsWith('192.168.')) {
    return true
  }

  const match172 = /^172\.(\d{1,3})\./.exec(host)
  if (match172) {
    const secondOctet = Number(match172[1])
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true
    }
  }

  return false
}

export function parseSecureHttpsUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl.trim())
    if (parsed.protocol !== 'https:') return null
    if (isPrivateOrLocalHost(parsed.hostname)) return null
    return parsed
  } catch {
    return null
  }
}

export function toSafeHttpsUrlString(rawUrl: string): string | null {
  const parsed = parseSecureHttpsUrl(rawUrl)
  return parsed ? parsed.toString() : null
}

export function isAcceptedSourceUrl(rawUrl: string): boolean {
  const parsed = parseSecureHttpsUrl(rawUrl)
  if (!parsed) return false

  const host = normalizeHost(parsed.hostname)
  return YOUTUBE_HOSTS.has(host) || TRUSTED_VIDEO_HOSTS.has(host)
}

export function isCloudinarySourceUrl(rawUrl: string): boolean {
  const parsed = parseSecureHttpsUrl(rawUrl)
  if (!parsed) return false

  const host = normalizeHost(parsed.hostname)
  return TRUSTED_VIDEO_HOSTS.has(host)
}

function normalizeHost(hostname: string) {
  return hostname.toLowerCase()
}

function extractYouTubeId(parsed: URL): string | null {
  const host = normalizeHost(parsed.hostname)
  if (!YOUTUBE_HOSTS.has(host)) return null

  const cleanId = (value: string | null) => {
    if (!value) return null
    return /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null
  }

  if (host === 'youtu.be') {
    return cleanId(parsed.pathname.split('/').find(Boolean) ?? null)
  }

  if (parsed.pathname === '/watch') {
    return cleanId(parsed.searchParams.get('v'))
  }

  const parts = parsed.pathname.split('/').filter(Boolean)
  const markerIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts')
  if (markerIndex >= 0) {
    return cleanId(parts[markerIndex + 1] ?? null)
  }

  return null
}

function extractVimeoId(parsed: URL): string | null {
  const host = normalizeHost(parsed.hostname)
  if (!host.endsWith('vimeo.com')) return null

  const match = /^\/(\d+)(?:\/|$)/.exec(parsed.pathname)
  return match?.[1] ?? null
}

function isTrustedVideoSource(parsed: URL): boolean {
  const host = normalizeHost(parsed.hostname)
  if (TRUSTED_VIDEO_HOSTS.has(host)) return true

  const path = parsed.pathname.toLowerCase()
  return Array.from(VIDEO_EXTENSIONS).some((extension) => path.endsWith(extension))
}

export function parseProjectMedia(url: string): ParsedMedia {
  const parsed = parseSecureHttpsUrl(url)
  if (!parsed) return { kind: 'unsupported' }

  const youtubeId = extractYouTubeId(parsed)
  if (youtubeId) {
    return {
      kind: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
    }
  }

  const vimeoId = extractVimeoId(parsed)
  if (vimeoId) {
    return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeoId}` }
  }

  if (isTrustedVideoSource(parsed)) {
    return { kind: 'video', src: parsed.toString() }
  }

  return { kind: 'unsupported' }
}

export function getSafeClipPreviewUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null

  const parsed = parseSecureHttpsUrl(rawUrl)
  if (!parsed) return null

  const host = normalizeHost(parsed.hostname)
  const path = parsed.pathname.toLowerCase()
  const hasVideoExtension = Array.from(VIDEO_EXTENSIONS).some((extension) => path.endsWith(extension))

  if (TRUSTED_VIDEO_HOSTS.has(host) || hasVideoExtension) {
    return parsed.toString()
  }

  return null
}

export function titleFromUrl(rawUrl: string) {
  const parsed = parseSecureHttpsUrl(rawUrl)
  if (!parsed) return 'Untitled project'

  const pathnameParts = parsed.pathname.split('/').filter(Boolean)
  const lastSegment = pathnameParts.at(-1)
  if (!lastSegment) return 'Untitled project'

  try {
    const decoded = decodeURIComponent(lastSegment)
    return decoded.length > 60 ? `${decoded.slice(0, 57)}...` : decoded
  } catch {
    return lastSegment.length > 60 ? `${lastSegment.slice(0, 57)}...` : lastSegment
  }
}

export function formatStatusLabel(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'queued') return 'Queued'
  if (normalized === 'done' || normalized === 'completed') return 'Done'
  if (normalized === 'failed' || normalized === 'error') return 'Failed'

  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

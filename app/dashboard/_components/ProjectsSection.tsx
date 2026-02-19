import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerTimeDisplay,
} from "@/components/kibo-ui/video-player";
import Link from "next/link";

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function getYouTubeEmbed(url: string) {
  const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/;
  const match = youtubeRegex.exec(url);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
}

function isVimeo(url: string) {
  return /vimeo\.com/.test(url);
}

function getVimeoEmbed(url: string) {
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const match = vimeoRegex.exec(url);
  return match ? `https://player.vimeo.com/video/${match[1]}` : "";
}

function isRawVideo(url: string) {
  return /\.(mp4|webm|ogg)$/.test(url) || url.includes("res.cloudinary.com");
}

export default function ProjectsSection({
  projects,
}: Readonly<{
  projects: { id: string; title: string | null; originalUrl: string; status: string }[];
}>) {
  return (
    <div className="flex flex-col gap-6 w-full py-5">
      <h3 className="text-2xl font-bold">
        All Projects ({projects.length})
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          // Decide which component to render for this video
          let VideoComponent;

          if (isYouTube(project.originalUrl)) {
            VideoComponent = (
              <iframe
                className="h-full w-full"
                src={getYouTubeEmbed(project.originalUrl)}
                title={project.title ?? "YouTube Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            );
          } else if (isVimeo(project.originalUrl)) {
            VideoComponent = (
              <iframe
                className="h-full w-full"
                src={getVimeoEmbed(project.originalUrl)}
                title={project.title ?? "Vimeo Video"}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            );
          } else if (isRawVideo(project.originalUrl)) {
            VideoComponent = (
              <VideoPlayer className="h-full w-full">
                <VideoPlayerContent
                  crossOrigin=""
                  muted
                  preload="auto"
                  autoPlay={false}
                  controls
                  src={project.originalUrl}
                />
                <VideoPlayerControlBar>
                  <VideoPlayerPlayButton />
                  <VideoPlayerTimeDisplay showDuration />
                </VideoPlayerControlBar>
              </VideoPlayer>
            );
          } else {
            VideoComponent = (
              <div className="h-full w-full flex items-center justify-center text-white text-sm">
                Video cannot be displayed
              </div>
            );
          }

          return (
            <div
              key={project.id}
              className="group overflow-hidden bg-black border border-white/10 hover:border-white/20 transition relative rounded"
            >
              {/* Video */}
              <div className="relative aspect-video bg-black">{VideoComponent}</div>

              {/* Meta + View clips */}
              <div className="p-3 flex items-center justify-between">
                <p className="font-semibold truncate">
                  {project.title ?? "Untitled project"}
                </p>
                <Link
                  href={`/dashboard/projects/${project.id}/clips`}
                  className="px-3 py-1 bg-white text-black text-xs font-semibold rounded hover:bg-white/90"
                >
                  View clips
                </Link>
              </div>

              {/* Status */}
              <div className="px-3 pb-3">
                <p className="text-sm text-white/60">{project.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
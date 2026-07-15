import { extractYouTubeId } from '@/lib/utils'
import { PlayCircle } from 'lucide-react'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = '動画' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video rounded-xl bg-muted text-muted-foreground gap-2">
        <PlayCircle className="h-10 w-10 opacity-30" />
        <p className="text-sm">動画を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  )
}

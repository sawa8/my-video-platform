import { extractYouTubeId } from '@/lib/utils'

interface YouTubeEmbedProps {
  url: string
  title?: string
}

export function YouTubeEmbed({ url, title = '動画' }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        動画を読み込めませんでした
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
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

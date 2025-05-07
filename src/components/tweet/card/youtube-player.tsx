import { extractVideoId } from "@/utils/string-util";

type Props = {
  firstLink: string | null;
}

type PlayerProps = {
  videoId: string;
}

export default function YouTubePlayer({ firstLink }: Props) {
  if (!firstLink) {
    return null;
  }

  const videoId = extractVideoId(firstLink);
  if (videoId) {
    return (
      <div className="mt-2 w-full">
        <InnerPlayer videoId={videoId} />
      </div>
    );
  }

  return null;
}

function InnerPlayer({ videoId }: PlayerProps) {
  return (
    <iframe
      width="100%"
      className="aspect-16/9"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      loading="lazy"
    ></iframe>
  );
}
"use client";
import Image, { ImageLoaderProps } from "next/image";

type Attachment = {
  id: number;
  fileUrl: string;
  mimeType: string | null;
  isSpoiler: boolean;
  width: number;
  height: number;
}

type Props = {
  attachment: Attachment;
}

export default function SingleImage({ attachment }: Props) {
  const aspect = `aspect-${attachment.width}/${attachment.height}`;

  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  return (
    <div className={`w-full ${aspect}`}>
      <Image
        className="rounded-lg"
        src={attachment.fileUrl}
        alt="Image"
        loader={imageLoader}
        unoptimized
        width={attachment.width}
        height={attachment.height}
      />
    </div>
  )
}
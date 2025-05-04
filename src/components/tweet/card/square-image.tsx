"use client";

import Image, { ImageLoaderProps } from "next/image";

import { Attachment } from "@/types/tweet";

type Props = {
  attachment: Attachment;
}

export default function SquareImage({ attachment }: Props) {
  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  return (
    <Image
      className={`rounded-lg object-cover h-full ${attachment.isSpoiler ? "blur-md brightness-50" : undefined}`}
      src={attachment.fileUrl}
      alt="Image"
      loader={imageLoader}
      unoptimized
      width={attachment.width}
      height={attachment.height}
    />
  )
}
"use client";
import Image, { ImageLoaderProps } from "next/image";

type Props = {
  src: string;
}

export default function UserAvatar({ src }: Props) {
  const imageSize = 64;

  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  return (
    <Image
      alt={`Avatar of user`}
      src={src}
      loader={imageLoader}
      width={imageSize}
      height={imageSize}
      unoptimized
    />
  )
}
"use client";
import Image, { ImageLoaderProps } from "next/image";

type Props = {
  src: string;
}

export default function UserAvatar({ src }: Props) {
  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  return (
    <Image
      alt={`Avatar of user`}
      src={src}
      loader={imageLoader}
      width={32}
      height={32}
      unoptimized
    />
  )
}
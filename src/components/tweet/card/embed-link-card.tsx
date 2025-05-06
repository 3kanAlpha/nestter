"use client";
import Image, { ImageLoaderProps } from "next/image";
import { SelectEmbedLinks } from "@/db/schema";

type Props = {
  embed: SelectEmbedLinks;
}

export default function EmbedLinkCard({ embed }: Props) {
  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  return (
    <div className="w-full">
      <a href={embed.url} target="_blank" rel="noopener noreferrer">
        <div className="card bg-base-100 dark:bg-tw-body card-border-base-200 w-full shadow-sm">
          <figure>
            <Image
              className="object-cover w-full aspect-1200/630"
              src={embed.imageUrl}
              alt=""
              loader={imageLoader}
              unoptimized
              width={embed.imageWidth}
              height={embed.imageHeight}
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">{ embed.title }</h2>
            <p className="line-clamp-2 wrap-anywhere">{ embed.description }</p>
          </div>
        </div>
      </a>
      <div className="mt-1 pl-2">
        <p className="text-gray-500 text-sm w-64 truncate">Source: {embed.publisher}</p>
      </div>
    </div>
  );
}
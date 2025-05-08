"use client";
import { useState } from "react";
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
  const ar = attachment.width / attachment.height;
  const [hideImage, setHideImage] = useState(attachment.isSpoiler);
  const [showOverlay, setShowOverlay] = useState(false);

  function imageLoader({ src }: ImageLoaderProps) {
    return src;
  }

  function showImage() {
    if (hideImage) {
      setHideImage(false);
    }
  }

  function toggleOverlay() {
    setShowOverlay(!showOverlay);
  }

  return (
    <>
      <div className={`stack w-full`} style={{
        aspectRatio: ar < 0.5 ? 0.5 : ar,
      }}>
        { hideImage && (
          <div
            className="text-primary-content grid place-content-center"
            onClick={showImage}
          >
            <span className="text-sm pointer-events-none">クリックして表示</span>
          </div>
        ) }
        <Image
          className={`rounded-lg object-cover relative h-full ${hideImage ? "blur-md brightness-50" : undefined}`}
          src={attachment.fileUrl}
          alt="Image"
          loader={imageLoader}
          unoptimized
          width={attachment.width}
          height={attachment.height}
          onClick={toggleOverlay}
        />
      </div>
      {/* オーバーレイ */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-white text-xl"
            onClick={toggleOverlay}
            aria-label="Close overlay"
          >
            ✕
          </button>
          <Image
            src={attachment.fileUrl}
            alt="拡大画像"
            loader={imageLoader}
            unoptimized
            width={attachment.width}
            height={attachment.height}
            className="max-w-screen lg:max-w-[90vw] max-h-[85vh] object-contain shadow-lg"
          />
        </div>
      )}
    </>
  )
}
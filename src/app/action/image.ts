"use server";
import { client, R2_URL } from "./r2/client";
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon/next";
import { auth } from "@/auth";

const BUCKET_NAME = "nestter-images";

async function deleteFile(fileKey: string) {
  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  await client.fetch(fileUrl, {
    method: "DELETE",
    headers: {
      host: new URL(R2_URL).host,
    },
  });
}

/** 画像を最大長辺400pxに変形してwebp形式に変換する */
async function resizeUserAvatar(bytes: Uint8Array): Promise<Uint8Array | null> {
  const image = PhotonImage.new_from_byteslice(bytes);
  const width = image.get_width();
  const height = image.get_height();
  const shortSide = Math.min(width, height);
  if (shortSide < 128) {
    return null;
  }
  const resizeTo = Math.min(shortSide, 400);
  const outImage = resize(
    image,
    resizeTo,
    resizeTo,
    SamplingFilter.Lanczos3,
  )
  const outBytes = outImage.get_bytes_webp();

  // free memory
  image.free();
  outImage.free();
  return outBytes;
}

/** ユーザーのアイコン画像をR2にアップロードする */
export async function uploadUserAvatar(avatar: Uint8Array, fileKey: string, oldUrl?: string): Promise<string | null> {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return null;
  }

  const resizedBytes = await resizeUserAvatar(avatar);
  if (!resizedBytes) {
    return null;
  }

  const fileUrl = `${R2_URL}/${BUCKET_NAME}/${fileKey}`;

  const res = await client.fetch(fileUrl, {
    method: "PUT",
    headers: {
      host: new URL(R2_URL).host,
      "Content-Length": resizedBytes.length.toString(),
    },
    body: resizedBytes,
  });

  if (res.ok) {
    if (oldUrl && oldUrl.startsWith("https://img.nest.mgcup.net/")) {
      const oldFileKey = oldUrl.replace("https://img.nest.mgcup.net/", "");
      deleteFile(oldFileKey);
    }

    return "https://img.nest.mgcup.net/" + fileKey;
  }

  return null;
}
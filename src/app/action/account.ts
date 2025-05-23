"use server";

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { users, follows } from "@/db/schema";
import { uploadTempImage } from './image';
import { getStringLength } from "@/utils/string-util";
import { calcDigest } from '@/utils/hash-util';
import { ACCOUNT_BIO_MAX_LENGTH, ACCOUNT_DISPLAY_NAME_MAX_LENGTH } from '@/consts/account';
import { invokeUploadAvatar } from './lambda';

/** アカウントの初期設定をする */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initializeAccount(prev: any, formData: FormData) {
  const session = await auth();
  if (!session) {
    return {
      status: "error",
      message: "You need to log in",
    }
  }

  const sesUserId = Number(session.user.id);

  const screenName = (formData.get("screenName") as string).trim();
  if (screenName.length > 15) {
    return {
      status: "error",
      message: "アカウントIDは15文字以下である必要があります",
    }
  } else if (screenName.length < 3) {
    return {
      status: "error",
      message: "アカウントIDは3文字以上である必要があります",
    }
  }

  const screenNamePattern = /^\w+$/g;
  if (!screenNamePattern.test(screenName)) {
    return {
      status: "error",
      message: "アカウントIDに使用できない文字列が含まれています",
    }
  }

  const canUseName = await isScreenNameAvailable(screenName);
  if (!canUseName) {
    return {
      status: "error",
      message: "このアカウントIDは既に使用されています",
    }
  }

  const displayName = (formData.get("displayName") as string).trim();
  if (getStringLength(displayName) > ACCOUNT_DISPLAY_NAME_MAX_LENGTH) {
    return {
      status: "error",
      message: "表示名は50文字以下である必要があります",
    }
  } else if (getStringLength(displayName) === 0) {
    return {
      status: "error",
      message: "表示名を空にすることはできません",
    }
  }

  const regPassword = (formData.get("regPassword") as string).trim();
  const regPassHash = await calcDigest(regPassword);
  if (regPassHash !== process.env.REG_PASSWORD) {
    return {
      status: "error",
      message: "登録用パスワードが一致しません",
    }
  }

  const avatarUrl = session.user.image;

  const reqBody = {
    screenName: screenName,
    displayName: displayName,
    avatarUrl: avatarUrl ? avatarUrl : null,
    accountLevel: 1,
  }

  await db.update(users).set(reqBody).where(eq(users.id, sesUserId));

  redirect("/");
}

async function _getUserByScreenName(screenName: string) {
  const session = await auth();
  const sesUserId = session?.user ? Number(session.user.id) : 0;

  const res = await db.select({
    id: users.id,
    createdAt: users.createdAt,
    screenName: users.screenName,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
    website: users.website,
    location: users.location,
    accountLevel: users.accountLevel,
    followingCount: db.$count(follows, eq(follows.followerId, users.id)),
    followerCount: db.$count(follows, eq(follows.followeeId, users.id)),
    isFollowed: sql<boolean>`${follows.followerId} IS NOT NULL`.as('isFollowed'),
  })
    .from(users)
    .leftJoin(follows, and(eq(follows.followerId, sesUserId), eq(follows.followeeId, users.id)))
    .where(eq(users.screenName, screenName))
    .limit(1);
  return res.length > 0 ? res[0] : null;
}

/** スクリーンネームからユーザーを取得する */
export const getUserByScreenName = cache(_getUserByScreenName);

/** 与えられたスクリーンネームが使用可能かどうか判定する */
export async function isScreenNameAvailable(screenName: string): Promise<boolean> {
  const count = await db.$count(users, eq(users.screenName, screenName));
  return count === 0;
}

/** プロフィールを編集する */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePublicProfile(prev: any, formData: FormData) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return {
      status: "error",
      message: "この操作にはログインが必要です",
    };
  }

  const sesUserId = Number(session.user.id);

  const displayName = (formData.get("displayName") as string).trim();
  if (getStringLength(displayName) > ACCOUNT_DISPLAY_NAME_MAX_LENGTH) {
    return {
      status: "error",
      message: "表示名は50文字以下である必要があります",
    };
  } else if (getStringLength(displayName) === 0) {
    return {
      status: "error",
      message: "表示名は空でない必要があります",
    };
  }

  const bio = (formData.get("bio") as string).trim();
  if (getStringLength(bio) > ACCOUNT_BIO_MAX_LENGTH) {
    return {
      status: "error",
      message: "自己紹介は160文字以下である必要があります",
    };
  }

  const location = (formData.get("location") as string).trim();
  const website = (formData.get("website") as string).trim();

  // 簡易的にプロトコルとドメイン部だけを確認
  const urlPattrn = /^https?:\/\/[\w\.-]+\.\w+/g;
  if (website.length > 0 && !urlPattrn.test(website)) {
    return {
      status: "error",
      message: "ウェブサイトに無効なアドレスが指定されています",
    };
  }

  const avatarContent = formData.get("avatarImage") as File;
  let avatarUrl = undefined;
  if (avatarContent.size > 0) {
    if (avatarContent.size > 5 * 1024 * 1024) {
      return {
        status: "error",
        message: "画像の最大サイズは5MiBです",
      };
    }
    const arrayBuf = await avatarContent.arrayBuffer();

    const tempKey = await uploadTempImage(arrayBuf, avatarContent.name);
    if (tempKey) {
      const r = await invokeUploadAvatar(tempKey, session.user.avatarUrl ?? "");
      if (r) {
        avatarUrl = r;
      } else {
        return {
          status: "error",
          message: "画像の変換に失敗しました",
        };
      }
    } else {
      return {
        status: "error",
        message: "画像のアップロードに失敗しました",
      };
    }
  }

  const reqBody = {
    displayName: displayName,
    bio: bio || null,
    location: location || null,
    website: website || null,
    avatarUrl: avatarUrl,
  }

  await db.update(users).set(reqBody).where(eq(users.id, sesUserId));

  revalidatePath(`/user/${session.user.screenName}`);
  redirect(`/user/${session.user.screenName}`);
}
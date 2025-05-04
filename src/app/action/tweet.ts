"use server";

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getTableColumns, eq, desc, lt, gt, lte, gte, ilike, and, sql } from "drizzle-orm";
import { alias } from 'drizzle-orm/pg-core'

import { auth } from "@/auth";
import { db } from "@/db/client";
import { tweets, users, tweetAttachments, favorites, InsertTweet } from "@/db/schema";
import { getStringLength } from "@/utils/string-util";
import { uploadTempImage } from './image';
import { invokeUploadImage } from './lambda';
import { TWEET_TEXT_MAX_LENGTH, TWEET_IMAGE_MAX_SIZE_MB } from '@/consts/tweet';

type SearchOptions = {
  q?: string;
  from?: string;
  searchFaved?: boolean;
}

const replyTweets = alias(tweets, 'replyTweets')
const replyUsers = alias(users, 'replyUsers');
const replyAttachments = alias(tweetAttachments, 'replyAttachments');
const myFav = alias(favorites, 'myfav');

/** 指定したIDのツイートが存在するかどうか検証する */
async function isTweetExist(tweetId: number) {
  const res = await db.select({ id: tweets.id }).from(tweets).where(eq(tweets.id, tweetId)).limit(1);
  return res.length > 0;
}

/** 指定したIDのツイートを取得する */
async function _getTweetById(tweetId: number) {
  const session = await auth();
  const rawUserId = Number(session?.user.id)
  const sesUserId = Number.isFinite(rawUserId) ? rawUserId : 0;

  const res = await db
    .select({
      tweet: {
        ...getTableColumns(tweets),
      },
      user: {
        id: users.id,
        screenName: users.screenName,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      attachment: {
        id: tweetAttachments.id,
        fileUrl: tweetAttachments.fileUrl,
        mimeType: tweetAttachments.mimeType,
        isSpoiler: tweetAttachments.isSpoiler,
        width: tweetAttachments.imageWidth,
        height: tweetAttachments.imageHeight,
      },
      engagement: {
        isFaved: sql<boolean>`${favorites.userId} IS NOT NULL`.as('isFaved'),
        favedTimestamp: favorites.createdAt,
      }
    })
    .from(tweets)
    .where(eq(tweets.id, tweetId))
    .innerJoin(users, eq(tweets.userId, users.id))
    .leftJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, sesUserId)))
    .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
    .limit(1)
  
    return res.length > 0 ? res[0] : null;
}

/** 指定したIDのツイートを取得する */
export const getTweetById = cache(_getTweetById);

export async function getReplyTarget(tweetId: number) {
  const res = await db
    .select({ id: tweets.id, name: users.screenName })
    .from(tweets)
    .where(eq(tweets.id, tweetId))
    .innerJoin(users, eq(tweets.userId, users.id))
    .limit(1);
  return res.length > 0 ? res[0] : null;
}

export async function searchTweetsB(minTweetId?: number, maxTweetId?: number, options?: SearchOptions) {
  const session = await auth();
  if (options?.searchFaved && (!session || !session.user.screenName)) {
    return [];
  }
  const rawUserId = Number(session?.user.id)
  const sesUserId = Number.isFinite(rawUserId) ? rawUserId : 0;

  console.log(`Searching Tweets : range=[${minTweetId ?? 1}...${maxTweetId ?? ""}] options=${JSON.stringify(options)}`);
  const searchCond = [and(minTweetId ? gte(tweets.id, minTweetId) : undefined, (maxTweetId !== undefined) ? lte(tweets.id, maxTweetId) : undefined)];
  if (options?.q) {
    const parts = options.q.split(' ').filter(p => p.trim() !== '') ?? [];
    const textCond =
      parts.length > 0
        ? and(...parts.map(p => ilike(tweets.textContent, `%${p}%`)))
        : undefined;
    searchCond.push(textCond);
  }
  if (options?.from) {
    searchCond.push(eq(users.screenName, options.from));
  }
  searchCond.push(eq(tweets.isPending, false));

  const whereClause = and(...searchCond);

  const res = await db
    .select({
      tweet: {
        ...getTableColumns(tweets),
      },
      user: {
        id: users.id,
        screenName: users.screenName,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      attachment: {
        id: tweetAttachments.id,
        fileUrl: tweetAttachments.fileUrl,
        mimeType: tweetAttachments.mimeType,
        isSpoiler: tweetAttachments.isSpoiler,
        width: tweetAttachments.imageWidth,
        height: tweetAttachments.imageHeight,
      },
      engagement: {
        isFaved: sql<boolean>`${favorites.userId} IS NOT NULL`.as('isFaved'),
        favedTimestamp: favorites.createdAt,
      },
      replyTweet: {
        ...getTableColumns(replyTweets),
      },
      replyUser: {
        id: replyUsers.id,
        screenName: replyUsers.screenName,
        displayName: replyUsers.displayName,
        avatarUrl: replyUsers.avatarUrl,
      },
      replyAttachment: {
        id: replyAttachments.id,
        fileUrl: replyAttachments.fileUrl,
        mimeType: replyAttachments.mimeType,
        isSpoiler: replyAttachments.isSpoiler,
        width: replyAttachments.imageWidth,
        height: replyAttachments.imageHeight,
      },
    })
    .from(tweets)
    .where(whereClause)
    .innerJoin(users, eq(tweets.userId, users.id))
    .leftJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, sesUserId)))
    .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
    .leftJoin(replyTweets, eq(tweets.replyTo, replyTweets.id))
    .leftJoin(replyUsers, eq(replyTweets.userId, replyUsers.id))
    .leftJoin(replyAttachments, eq(replyAttachments.tweetId, replyTweets.id))
    .limit(20)
    .orderBy(desc(tweets.createdAt));
  return res;
}

/** ユーザーIDがtargetUserIdであるユーザーのいいねを取得する */
export async function searchFavedTweets(targetUserId: number, minTweetTimestamp?: string, maxTweetTimestamp?: string, options?: SearchOptions) {
  const session = await auth();
  const rawUserId = Number(session?.user.id);
  const myUserId = Number.isFinite(rawUserId) ? rawUserId : 0; // 閲覧しているユーザーのID

  console.log(`searchFavedTweets : user=${targetUserId} range=[${minTweetTimestamp ?? ""}...${maxTweetTimestamp ?? ""}] options=${JSON.stringify(options)}`);
  const searchCond = [and(minTweetTimestamp ? gt(favorites.createdAt, minTweetTimestamp) : undefined, maxTweetTimestamp ? lt(favorites.createdAt, maxTweetTimestamp) : undefined)];
  if (options?.q) {
    const parts = options.q.split(' ').filter(p => p.trim() !== '') ?? [];
    const textCond =
      parts.length > 0
        ? and(...parts.map(p => ilike(tweets.textContent, `%${p}%`)))
        : undefined;
    searchCond.push(textCond);
  }
  if (options?.from) {
    searchCond.push(eq(users.screenName, options.from));
  }
  searchCond.push(eq(tweets.isPending, false));

  const whereClause = and(...searchCond);

  const res = await db
    .select({
      tweet: {
        ...getTableColumns(tweets),
      },
      user: {
        id: users.id,
        screenName: users.screenName,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      attachment: {
        id: tweetAttachments.id,
        fileUrl: tweetAttachments.fileUrl,
        mimeType: tweetAttachments.mimeType,
        isSpoiler: tweetAttachments.isSpoiler,
        width: tweetAttachments.imageWidth,
        height: tweetAttachments.imageHeight,
      },
      engagement: {
        isFaved: sql<boolean>`${myFav.userId} IS NOT NULL`.as('isFaved'),
        favedTimestamp: favorites.createdAt,
      },
      replyTweet: {
        ...getTableColumns(replyTweets),
      },
      replyUser: {
        id: replyUsers.id,
        screenName: replyUsers.screenName,
        displayName: replyUsers.displayName,
        avatarUrl: replyUsers.avatarUrl,
      },
      replyAttachment: {
        id: replyAttachments.id,
        fileUrl: replyAttachments.fileUrl,
        mimeType: replyAttachments.mimeType,
        isSpoiler: replyAttachments.isSpoiler,
        width: replyAttachments.imageWidth,
        height: replyAttachments.imageHeight,
      },
    })
    .from(tweets)
    .where(whereClause)
    .innerJoin(users, eq(tweets.userId, users.id))
    .innerJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, targetUserId))) // 対象のユーザーがいいねした投稿のみフィルタ
    .leftJoin(myFav, and(eq(tweets.id, myFav.tweetId), eq(myFav.userId, myUserId))) // 自分がいいねしているかどうか検証するため
    .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
    .leftJoin(replyTweets, eq(tweets.replyTo, replyTweets.id))
    .leftJoin(replyUsers, eq(replyTweets.userId, replyUsers.id))
    .leftJoin(replyAttachments, eq(replyAttachments.tweetId, replyTweets.id))
    .limit(20)
    .orderBy(desc(favorites.createdAt));
  return res;
}

async function updateIsPending(tweetId: number, newState: boolean) {
  await db.update(tweets).set({ isPending: newState }).where(eq(tweets.id, tweetId));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertTweet(prev: any, formData: FormData) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return {
      status: "error",
      message: "この操作にはログインが必要です",
    }
  }

  const sesUserId = Number(session.user.id);

  const contentCRLF = (formData.get("textContent") as string).trim();
  const content = contentCRLF.replaceAll("\r\n", "\n"); // textareaの値は送信時CRLFに変換される
  if (getStringLength(content) > TWEET_TEXT_MAX_LENGTH) {
    return {
      status: "error",
      message: `ツイートは${TWEET_TEXT_MAX_LENGTH}文字以下である必要があります`,
    }
  }

  const attachments = formData.get("attachments") as File;
  if (attachments.size > 0 && !attachments.type.startsWith("image/")) {
    return {
      status: "error",
      message: "ツイートに添付できるファイル形式は画像のみ対応しています",
    };
  }
  if (attachments.size > TWEET_IMAGE_MAX_SIZE_MB * 1024 * 1024) {
    const fileSizeMb = attachments.size / (1024 * 1024);
    return {
      status: "error",
      message: `画像の最大サイズは${TWEET_IMAGE_MAX_SIZE_MB}MiBです (${fileSizeMb.toFixed(2)} MiB)`,
    };
  }

  // テキストも画像も無いツイートは作成不可
  if (getStringLength(content) === 0 && attachments.size === 0) {
    return {
      status: "error",
      message: "ツイートの内容を空にすることはできません",
    };
  }

  const isSpoilerText = formData.get("isSpoiler") as string;
  const isSpoiler = isSpoilerText === "on";

  const _replyTo = (formData.get("replyTo") as string).trim();
  const replyTo = Number(_replyTo);
  if (replyTo > 0) {
    const parentExist = await isTweetExist(replyTo);
    if (!parentExist) {
      return {
        status: "error",
        message: "リプライ先のツイートは存在しません",
      };
    }
  }

  const reqBody: InsertTweet = {
    textContent: content,
    userId: sesUserId,
    // 画像つきツイートはファイルのアップロードが終わるまで表示されないようにする
    isPending: (attachments.size > 0),
    replyTo: replyTo > 0 ? replyTo : undefined,
  }

  const row = await db.insert(tweets).values(reqBody).onConflictDoNothing().returning({ newTweetId: tweets.id });
  if (row.length === 0) {
    return {
      status: "error",
      message: "予期せぬエラーが発生しました",
    }
  }

  if (attachments.size > 0) {
    const parentTweetId = row[0].newTweetId;
    const arrayBuf = await attachments.arrayBuffer();

    const tempKey = await uploadTempImage(arrayBuf, attachments.name);
    if (tempKey) {
      const r = await invokeUploadImage(tempKey, parentTweetId, isSpoiler);
      if (!r) {
        await deleteTweet(parentTweetId);
        return {
          status: "error",
          message: "画像の変換に失敗しました（画像が大きすぎる可能性があります）",
        }
      }
      await updateIsPending(parentTweetId, false);
    } else {
      await deleteTweet(parentTweetId);
      return {
        status: "error",
        message: "添付ファイルのアップロードに失敗しました",
      }
    }
  }

  if (replyTo > 0) {
    // リプライならリプライ先のreplyCountをインクリメントする
    await db.update(tweets).set({ replyCount: sql`${tweets.replyCount} + 1` }).where(eq(tweets.id, replyTo));
  }

  redirect("/");
}

export async function deleteTweet(tweetId: number, currentPath?: string) {
  const session = await auth();
  if (!session || !session.user.screenName) {
    return {
      status: "error",
      message: "この操作にはログインが必要です",
    }
  }
  const sesUserId = Number(session.user.id);

  const row = await db.delete(tweets).where(and(eq(tweets.id, tweetId), eq(tweets.userId, sesUserId))).returning({ deletedTweetId: tweets.id, replyTo: tweets.replyTo });

  if (row.length > 0) {
    console.log(`Deleted tweet #${tweetId}`);

    if (row[0].replyTo) {
      // リプライならリプライ先のreplyCountをデクリメントする
      await db.update(tweets).set({ replyCount: sql`${tweets.replyCount} - 1` }).where(eq(tweets.id, row[0].replyTo));
    }

    if (currentPath) {
      redirect(currentPath);
    }
  }
}
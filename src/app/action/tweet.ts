"use server";

import { redirect } from 'next/navigation';
import { getTableColumns, aliasedTable, eq, desc, lt, gt, lte, gte, ilike, and, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { tweets, users, tweetAttachments, favorites, InsertTweet } from "@/db/schema";
import { getStringLength } from "@/utils/string-util";
import { uploadTweetAttachment } from './image';
import { TWEET_TETX_MAX_LENGTH } from '@/consts/tweet';

type SearchOptions = {
  q?: string;
  from?: string;
  searchFaved?: boolean;
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

  const whereClause = and(...searchCond);

  if (options?.searchFaved) {
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
      .where(whereClause)
      .innerJoin(users, eq(tweets.userId, users.id))
      .innerJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, sesUserId))) // いいねした投稿のみフィルタ
      .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
      .limit(20)
      .orderBy(desc(favorites.createdAt));
    return res;
  } else {
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
      .where(whereClause)
      .innerJoin(users, eq(tweets.userId, users.id))
      .leftJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, sesUserId)))
      .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
      .limit(20)
      .orderBy(desc(tweets.createdAt));
    return res;
  }
}

const myFav = aliasedTable(favorites, 'myfav');

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
      }
    })
    .from(tweets)
    .where(whereClause)
    .innerJoin(users, eq(tweets.userId, users.id))
    .innerJoin(favorites, and(eq(tweets.id, favorites.tweetId), eq(favorites.userId, targetUserId))) // 対象のユーザーがいいねした投稿のみフィルタ
    .leftJoin(myFav, and(eq(tweets.id, myFav.tweetId), eq(myFav.userId, myUserId))) // 自分がいいねしているかどうか検証するため
    .leftJoin(tweetAttachments, eq(tweets.id, tweetAttachments.tweetId))
    .limit(20)
    .orderBy(desc(favorites.createdAt));
  return res;
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

  const content = (formData.get("textContent") as string).trim();
  if (getStringLength(content) > TWEET_TETX_MAX_LENGTH) {
    return {
      status: "error",
      message: `ツイートは${TWEET_TETX_MAX_LENGTH}文字以下である必要があります`,
    }
  }

  const attachments = formData.get("attachments") as File;
  if (!attachments.type.startsWith("image/")) {
    return {
      status: "error",
      message: "ツイートに添付できるファイル形式は画像のみ対応しています",
    };
  }
  if (attachments.size > 5 * 1024 * 1024) {
    return {
      status: "error",
      message: "画像の最大サイズは5MiBです",
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

  const reqBody: InsertTweet = {
    textContent: content,
    userId: sesUserId,
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

    const r = await uploadTweetAttachment(arrayBuf, parentTweetId, isSpoiler);
    if (!r) {
      await deleteTweet(parentTweetId);
      return {
        status: "error",
        message: "添付ファイルのアップロードに失敗しました",
      }
    }
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

  const row = await db.delete(tweets).where(and(eq(tweets.id, tweetId), eq(tweets.userId, sesUserId))).returning({ deletedTweetId: tweets.id });

  if (row.length > 0) {
    console.log(`Deleted tweet #${tweetId}`)
    if (currentPath) {
      redirect(currentPath);
    }
  }
}
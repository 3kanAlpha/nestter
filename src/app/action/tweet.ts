"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTableColumns, eq, desc, lt, gt, ilike, and } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { tweets, users, InsertTweet } from "@/db/schema";
import { getStringLength } from "@/utils/string-util";

type SearchOptions = {
  q?: string;
  from?: string;
}

export async function searchTweets(lastTweetId: number, options?: SearchOptions) {
  console.log(`Searching Tweets : lastTweetId=${lastTweetId} options=${JSON.stringify(options)}`);
  const searchCond = [lastTweetId > 0 ? lt(tweets.id, lastTweetId) : undefined];
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
      }
    })
    .from(tweets)
    .where(whereClause)
    .innerJoin(users, eq(tweets.userId, users.id))
    .limit(20)
    .orderBy(desc(tweets.createdAt));
  return res;
}

/** 指定されたIDよりも新しいツイートを検索する */
export async function searchNewTweets(topTweetId: number, options?: SearchOptions) {
  console.log(`calling searchNewTweets : topTweetId=${topTweetId} options=${JSON.stringify(options)}`);
  const searchCond = [topTweetId > 0 ? gt(tweets.id, topTweetId) : undefined];
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
      }
    })
    .from(tweets)
    .where(whereClause)
    .innerJoin(users, eq(tweets.userId, users.id))
    .limit(20)
    .orderBy(desc(tweets.createdAt));
  return res;
}

export async function getTweetsByUserId(userId: number) {
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
      }
    })
    .from(tweets)
    .where(eq(tweets.userId, userId))
    .innerJoin(users, eq(tweets.userId, users.id))
    .limit(20)
    .orderBy(desc(tweets.createdAt));
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
  if (content.length === 0) {
    return {
      status: "error",
      message: "ツイートの内容を空にすることはできません",
    }
  } else if (getStringLength(content) > 280) {
    return {
      status: "error",
      message: "ツイートは280文字以下である必要があります",
    }
  }

  const reqBody: InsertTweet = {
    textContent: content,
    userId: sesUserId,
  }

  await db.insert(tweets).values(reqBody).onConflictDoNothing();

  revalidatePath("/");
  redirect("/");
}
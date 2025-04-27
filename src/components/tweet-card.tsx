"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "./header/user-avatar";
import TweetText from "./tweet/tweet-text";
import { defaultAvatarUrl } from '@/consts/account';
import type { SelectTweet } from "@/db/schema";

type User = {
  id: number;
  screenName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

type Props = {
  tweet: SelectTweet;
  user: User;
  isRetweet?: boolean;
}

export default function TweetCard({ tweet, user, isRetweet = false }: Props) {
  return (
    <div className="card card-border bg-base-100 dark:bg-tw-body w-full p-3 join-item">
      { isRetweet && (
        <div className="flex flex-row items-center gap-1 text-gray-500 text-sm mb-1 pl-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M10 4.5c1.215 0 2.417.055 3.604.162a.68.68 0 0 1 .615.597c.124 1.038.208 2.088.25 3.15l-1.689-1.69a.75.75 0 0 0-1.06 1.061l2.999 3a.75.75 0 0 0 1.06 0l3.001-3a.75.75 0 1 0-1.06-1.06l-1.748 1.747a41.31 41.31 0 0 0-.264-3.386 2.18 2.18 0 0 0-1.97-1.913 41.512 41.512 0 0 0-7.477 0 2.18 2.18 0 0 0-1.969 1.913 41.16 41.16 0 0 0-.16 1.61.75.75 0 1 0 1.495.12c.041-.52.093-1.038.154-1.552a.68.68 0 0 1 .615-.597A40.012 40.012 0 0 1 10 4.5ZM5.281 9.22a.75.75 0 0 0-1.06 0l-3.001 3a.75.75 0 1 0 1.06 1.06l1.748-1.747c.042 1.141.13 2.27.264 3.386a2.18 2.18 0 0 0 1.97 1.913 41.533 41.533 0 0 0 7.477 0 2.18 2.18 0 0 0 1.969-1.913c.064-.534.117-1.071.16-1.61a.75.75 0 1 0-1.495-.12c-.041.52-.093 1.037-.154 1.552a.68.68 0 0 1-.615.597 40.013 40.013 0 0 1-7.208 0 .68.68 0 0 1-.615-.597 39.785 39.785 0 0 1-.25-3.15l1.689 1.69a.75.75 0 0 0 1.06-1.061l-2.999-3Z" clipRule="evenodd" />
          </svg>
          <p>{ user.displayName }さんがリツイート</p>
        </div>
      ) }
      <div className="flex flex-row gap-3">
        <div className="flex-none">
          <div className="avatar my-1">
            <div className="w-14 rounded">
              <Link href={`/user/${user.screenName}`}>
                <UserAvatar src={user.avatarUrl ?? defaultAvatarUrl} />
              </Link>
            </div>
          </div>
        </div>
        <div className="grow flex flex-col">
          <div className="flex flex-row items-center flex-nowrap gap-3">
            <p className="truncate">
              <Link href={`/user/${user.screenName}`}>
                <span className="font-semibold">{ user.displayName }</span><span className="ml-2 text-gray-500 text-sm">@{ user.screenName }</span>
              </Link>
            </p>
            <p className="text-gray-500 text-sm min-w-fit">
              { formatDistanceToNow(new Date(tweet.createdAt)) }
            </p>
          </div>
          <div className="mb-4 grow">
            <p className="whitespace-pre-wrap wrap-anywhere pr-1">
              <TweetText textContent={tweet.textContent} />
            </p>
          </div>
          <div className="flex flex-row justify-around w-[90%] text-gray-500">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5" />
              </svg>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
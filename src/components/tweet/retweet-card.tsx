"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from "date-fns";
import SingleImage from "@/components/tweet/single-image";
import UserAvatar from "@/components/header/user-avatar";
import TweetText from "@/components/tweet/tweet-text";
import ReplyButton from "@/components/tweet/card/reply-button";
import RetweetButton from "@/components/tweet/card/retweet-button";
import FavoriteButton from "@/components/tweet/card/favorite-button";
import { defaultAvatarUrl } from '@/consts/account';
import { PREVENT_NAVIGATION_CLASS } from "@/consts/layout";
import { User, Attachment } from "@/types/tweet";
import type { SelectTweet } from "@/db/schema";

type ReplyTweet = {
  tweet: SelectTweet;
  user: User;
  attachments: Attachment[] | null;
}

type Props = {
  user: User;
  authUserId?: number;
  /** ツイートを閲覧しているユーザーが親ツイートをいいね済みか */
  isFaved?: boolean;
  /** ツイートを閲覧しているユーザーが親ツイートをリツイート済みか */
  isRetweeted?: boolean;
  retweet: ReplyTweet;
}

export default function RetweetCard({ user, authUserId, isFaved = false, isRetweeted = false, retweet }: Props) {
  const router = useRouter();

  function handleClickCard(e: React.MouseEvent<HTMLDivElement>) {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest('a') || e.target.closest('img') || e.target.closest('button')) return;
    if (e.target.classList.contains(PREVENT_NAVIGATION_CLASS)) return;
    const parent = e.target.closest("div");
    if (parent && parent.classList.contains(PREVENT_NAVIGATION_CLASS)) {
      return;
    }
    router.push(`/post/${retweet.tweet.id}`);
  }

  return (
    <>
      <div
        className="card card-border bg-base-100 dark:bg-tw-body w-full p-3 join-item cursor-pointer"
        onClick={handleClickCard}
        tabIndex={0}
      >
        <div className="flex flex-row items-center gap-1 text-gray-500 text-sm mb-1 pl-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M10 4.5c1.215 0 2.417.055 3.604.162a.68.68 0 0 1 .615.597c.124 1.038.208 2.088.25 3.15l-1.689-1.69a.75.75 0 0 0-1.06 1.061l2.999 3a.75.75 0 0 0 1.06 0l3.001-3a.75.75 0 1 0-1.06-1.06l-1.748 1.747a41.31 41.31 0 0 0-.264-3.386 2.18 2.18 0 0 0-1.97-1.913 41.512 41.512 0 0 0-7.477 0 2.18 2.18 0 0 0-1.969 1.913 41.16 41.16 0 0 0-.16 1.61.75.75 0 1 0 1.495.12c.041-.52.093-1.038.154-1.552a.68.68 0 0 1 .615-.597A40.012 40.012 0 0 1 10 4.5ZM5.281 9.22a.75.75 0 0 0-1.06 0l-3.001 3a.75.75 0 1 0 1.06 1.06l1.748-1.747c.042 1.141.13 2.27.264 3.386a2.18 2.18 0 0 0 1.97 1.913 41.533 41.533 0 0 0 7.477 0 2.18 2.18 0 0 0 1.969-1.913c.064-.534.117-1.071.16-1.61a.75.75 0 1 0-1.495-.12c-.041.52-.093 1.037-.154 1.552a.68.68 0 0 1-.615.597 40.013 40.013 0 0 1-7.208 0 .68.68 0 0 1-.615-.597 39.785 39.785 0 0 1-.25-3.15l1.689 1.69a.75.75 0 0 0 1.06-1.061l-2.999-3Z" clipRule="evenodd" />
          </svg>
          <p>{ user.displayName }さんがリツイート</p>
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex-none">
            <div className="avatar my-1">
              <div className="w-14 rounded">
                <Link href={`/user/${retweet.user.screenName}`}>
                  <UserAvatar src={retweet.user.avatarUrl ?? defaultAvatarUrl} />
                </Link>
              </div>
            </div>
          </div>
          <div className="grow flex flex-col">
            <div className="flex flex-row items-center flex-nowrap gap-3">
              <p className="truncate">
                <Link href={`/user/${retweet.user.screenName}`}>
                  <span className="font-semibold">{ retweet.user.displayName }</span><span className="ml-2 text-gray-500 text-sm">@{ retweet.user.screenName }</span>
                </Link>
              </p>
              <p className="text-gray-500 text-sm min-w-fit">
                { formatDistanceToNow(new Date(retweet.tweet.createdAt)) }
              </p>
            </div>
            <div className="mb-4 grow pr-2">
              <p className="whitespace-pre-wrap wrap-anywhere overflow-hidden text-clip">
                <TweetText textContent={retweet.tweet.textContent} />
              </p>
              { retweet.attachments && (
                <div className="mt-2">
                  { retweet.attachments.length === 1 && <SingleImage attachment={retweet.attachments[0]} /> }
                </div>
              ) }
            </div>
            <div className="flex flex-row justify-between w-[90%] text-gray-500">
              {/* リプライ */}
              <ReplyButton
                replyTo={{
                  id: retweet.tweet.id,
                  screenName: retweet.user.screenName ?? "xxx",
                }}
                replyCount={retweet.tweet.replyCount}
                auth={authUserId !== undefined}
              />
              {/* リツイート */}
              <RetweetButton tweetId={retweet.tweet.id} retweetCount={retweet.tweet.retweetCount} isRetweeted={isRetweeted} auth={authUserId !== undefined} />
              {/* いいね */}
              <FavoriteButton tweetId={retweet.tweet.id} favCount={retweet.tweet.favoriteCount} isFaved={isFaved} auth={authUserId !== undefined} />
              {/* 共有 */}
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              </div>
              {/* その他ツイート操作 */}
              <div className={`dropdown dropdown-end ${PREVENT_NAVIGATION_CLASS}`}>
                <div tabIndex={0} role="button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-42 mt-1 p-2 shadow-sm text-xs text-black dark:text-white">
                  <li>
                    <Link href={`/post/${retweet.tweet.id}/reaction`}>
                      <div className="flex flex-row items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                        </svg>
                        ツイートの反応
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
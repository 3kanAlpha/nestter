"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { formatDistanceToNow } from "date-fns";
import SingleImage from "./tweet/single-image";
import UserAvatar from "./header/user-avatar";
import TweetText from "./tweet/tweet-text";
import FavoriteButton from "./tweet/card/favorite-button";
import { defaultAvatarUrl } from '@/consts/account';
import { deleteTweet } from "@/app/action/tweet";
import type { SelectTweet } from "@/db/schema";

type User = {
  id: number;
  screenName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

type Attachments = {
  id: number;
  fileUrl: string;
  mimeType: string | null;
  isSpoiler: boolean;
  width: number;
  height: number;
}[]

type Props = {
  tweet: SelectTweet;
  user: User;
  attachments: Attachments | null;
  isRetweet?: boolean;
  authUserId?: number;
  isFaved?: boolean;
}

export default function TweetCard({ tweet, user, attachments, isRetweet = false, authUserId, isFaved = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dialogId = `tweet-card-${tweet.id}-delete-confirm-dialog`;

  async function handleDeleteTweet() {
    await deleteTweet(tweet.id, pathname);
    router.refresh(); // ページの表示を更新する
  }

  return (
    <>
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
            <div className="mb-4 grow pr-2">
              <p className="whitespace-pre-wrap wrap-anywhere overflow-hidden text-clip">
                <TweetText textContent={tweet.textContent} />
              </p>
              { attachments && (
                <div className="mt-2">
                  { attachments.length === 1 && <SingleImage attachment={attachments[0]} /> }
                </div>
              ) }
            </div>
            <div className="flex flex-row justify-between w-[90%] text-gray-500">
              {/* リプライ */}
              <div className="flex flex-row items-center gap-1 w-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
              </div>
              {/* リツイート */}
              <div className="flex flex-row items-center gap-1 w-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                </svg>
              </div>
              {/* いいね */}
              <FavoriteButton tweetId={tweet.id} favCount={tweet.favoriteCount} isFaved={isFaved} auth={authUserId !== undefined} />
              {/* 共有 */}
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              </div>
              {/* その他ツイート操作 */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-42 mt-1 p-2 shadow-sm text-xs text-black dark:text-white">
                  { authUserId === tweet.userId && <DeleteTweetOption dialogId={dialogId} /> }
                  <li><a>なにもない</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <dialog id={dialogId} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ツイートを削除</h3>
          <p className="pt-4">ツイートを削除してもよろしいですか？</p>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex flex-row gap-2">
                <button className="btn btn-outline">キャンセル</button>
                <button
                  className="btn btn-primary"
                  onClick={handleDeleteTweet}
                >削除</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

function DeleteTweetOption({ dialogId }: { dialogId: string }) {
  return (
    <>
      <li className="text-red-500">
        <a onClick={()=>document.querySelector(`dialog#${dialogId}`)!.showModal()}>
          <div className="flex flex-row items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <span>ツイートを削除</span>
          </div>
        </a>
      </li>
    </>
  )
}
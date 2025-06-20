"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import SingleImage from "@/components/tweet/single-image";
import UserAvatar from "@/components/header/user-avatar";
import FakeTweetText from "@/components/tweet/card/fake-tweet-text";
import ReplyButton from "@/components/tweet/card/reply-button";
import RetweetButton from "@/components/tweet/card/retweet-button";
import FavoriteButton from "@/components/tweet/card/favorite-button";
import ShareButton from "@/components/tweet/card/share-button";

import { defaultAvatarUrl } from '@/consts/account';
import { PREVENT_NAVIGATION_CLASS } from "@/consts/layout";
import { User, Attachment, EmbedExtraParams } from "@/types/tweet";
import { deleteTweet } from "@/app/action/tweet";
import type { SelectTweet, SelectEmbedLinks } from "@/db/schema";

type ReplyTweet = {
  tweet: SelectTweet;
  user: User;
  attachments: Attachment[] | null;
}

type Props = {
  tweet: SelectTweet;
  user: User;
  authUserId?: number;
  /** ツイートを閲覧しているユーザーがいいね済みか */
  isFaved?: boolean;
  /** ツイートを閲覧しているユーザーがリツイート済みか */
  isRetweeted?: boolean;
  retweet?: ReplyTweet;
  embed: SelectEmbedLinks;
}

export default function FakeTweetCard({ tweet, user, authUserId, isFaved = false, isRetweeted = false, embed }: Props) {
  const router = useRouter();
  const dialogId = `tweet-card-${tweet.id}-delete-confirm-dialog`;

  const embedScreenName = embed.twitterCreator!.slice(1);
  const embedDisplayName = embed.title.replace(` (${embed.twitterCreator})`, "");
  const embedExtraParams: EmbedExtraParams = embed.extraParams ?? {};
  const embedAttachemnt = {
    id: 0,
    fileUrl: embed.imageUrl,
    mimeType: "image/webp",
    isSpoiler: embedExtraParams.isSpoiler ?? false,
    width: embed.imageWidth,
    height: embed.imageHeight,
  }

  async function handleDeleteTweet() {
    await deleteTweet(tweet.id);
    router.refresh(); // ページの表示を更新する
  }

  return (
    <>
      <div
        className="card card-border bg-base-100 dark:bg-tw-body w-full p-3 join-item cursor-pointer"
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
                <a href={`https://x.com/${embedScreenName}`} target="_blank" rel="noopener noreferrer">
                  <UserAvatar src={embed.logoUrl ?? defaultAvatarUrl} />
                </a>
              </div>
            </div>
          </div>
          <div className="grow flex flex-col">
            <div className="w-full mb-3">
              <a
                className="inline-block w-56"
                href={`https://x.com/${embedScreenName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-56 flex flex-col">
                  <span className="font-semibold truncate min-w-0">{ embedDisplayName }</span>
                  <span className="text-gray-500 text-sm">@{ embedScreenName }</span>
                </div>
              </a>
            </div>
            <div className="mb-4 grow pr-2">
              <p className="whitespace-pre-wrap wrap-anywhere overflow-hidden text-clip">
                <FakeTweetText textContent={embed.description ?? ""} />
              </p>
              { embed.imageUrl.length > 0 && (
                <div className="mt-2">
                  <SingleImage attachment={embedAttachemnt} />
                </div>
              ) }
              <div className="pl-2">
                <p className="text-gray-500 text-sm">
                  Source: <a href={embed.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{ embed.publisher }</a>
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between w-[90%] text-gray-500">
              {/* リプライ */}
              <ReplyButton
                replyTo={{
                  id: tweet.id,
                  screenName: user.screenName ?? "xxx",
                }}
                replyCount={tweet.replyCount}
                auth={false}
              />
              {/* リツイート */}
              <RetweetButton tweetId={tweet.id} retweetCount={tweet.retweetCount} isRetweeted={isRetweeted} auth={false} />
              {/* いいね */}
              <FavoriteButton tweetId={tweet.id} favCount={tweet.favoriteCount} isFaved={isFaved} auth={authUserId !== undefined} />
              {/* 共有 */}
              <ShareButton tweetId={tweet.id} />
              {/* その他ツイート操作 */}
              <div className={`dropdown dropdown-end ${PREVENT_NAVIGATION_CLASS}`}>
                <div tabIndex={0} role="button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-42 mt-1 p-2 shadow-sm text-xs text-black dark:text-white">
                  { authUserId === tweet.userId && <DeleteTweetOption dialogId={dialogId} /> }
                  <li>
                    <Link href={`/post/${tweet.id}/reaction`}>
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
import Link from "next/link";
import UserAvatar from "@/components/header/user-avatar";
import TweetText from "@/components/tweet/tweet-text";
import SquareImage from "./square-image";
import { defaultAvatarUrl } from "@/consts/account";

import type { SelectTweet } from "@/db/schema";
import { User, Attachment } from "@/types/tweet";

type Props = {
  tweet: SelectTweet;
  user: User;
  attachments: Attachment[] | null;
}

export default function EmbedReplyCard({ tweet, user, attachments }: Props) {
  return (
    <Link href={`/post/${tweet.id}`}>
      <div className="card bg-base-200 dark:bg-slate-700 w-full p-4 text-sm">
        <div className="flex flex-row items-center gap-2 mb-2">
          <span className="text-gray-500">返信先</span>
          <div className="avatar">
            <div className="size-5 rounded">
              <UserAvatar src={user.avatarUrl ?? defaultAvatarUrl} />
            </div>
          </div>
          <span className="text-blue-500">@{ user.screenName }</span>
        </div>
        <div className="flex flex-row gap-2">
          <div className="grow">
            <p className="whitespace-pre-wrap wrap-anywhere line-clamp-2">
              { tweet.textContent.length > 0 ? <TweetText textContent={tweet.textContent} noLink /> : (
                <span className="text-gray-500 italic">本文なし</span>
              ) }
            </p>
          </div>
          { attachments && (
            <div className="size-14 rounded">
              <SquareImage attachment={attachments[0]} />
            </div>
          ) }
        </div>
      </div>
    </Link>
  )
}
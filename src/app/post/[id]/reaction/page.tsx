import Link from "next/link";
import { getTweetLikedUsers } from "@/app/action/favorite";
import UserAvatar from "@/components/header/user-avatar";
import { defaultAvatarUrl } from "@/consts/account";

type Props = {
  params: Promise<{ id: string }>
}

export default async function TweetReaction({ params }: Props) {
  const { id } = await params;
  const likedUsers = await getTweetLikedUsers(Number(id));

  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-4">
        <span className="text-xl font-semibold">ツイートの反応</span>
      </h2>
      <div className="w-screen lg:w-lg">
        <div className="tabs tabs-border">
          <input type="radio" name="tweet-reaction-tabs" className="tab" aria-label="いいねされました" defaultChecked />
          <div className="tab-content bg-base-100">
            { likedUsers.length > 0 ? (
              <div className="join join-vertical w-full">
                { likedUsers.map((e) => <UserCard key={e.userId} user={e} />) }
              </div>
            ) : (
              <p className="p-2">まだ何もありません</p>
            ) }
          </div>
        </div>
      </div>
    </div>
  )
}

type User = {
  userId: number;
  screenName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

type CardProps = {
  user: User;
}

function UserCard({ user }: CardProps) {
  return (
    <Link href={`/user/${user.screenName}`}>
      <div className="join-item card card-border bg-base-100 dark:bg-tw-body flex flex-row gap-3 p-3">
        <div className="avatar my-1">
          <div className="size-12 rounded">
            <UserAvatar src={user.avatarUrl ?? defaultAvatarUrl} />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="truncate">{ user.displayName }</p>
          <p className="text-gray-500 truncate">@{ user.screenName }</p>
          <p>{ user.bio }</p>
        </div>
      </div>
    </Link>
  )
}
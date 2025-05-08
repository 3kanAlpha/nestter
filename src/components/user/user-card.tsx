import Link from "next/link";
import UserAvatar from "@/components/header/user-avatar";

import { defaultAvatarUrl } from "@/consts/account";

type User = {
  id: number;
  screenName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

type Props = {
  user: User;
}

export default function UserCard({ user }: Props) {
  return (
    <Link href={`/user/${user.screenName}`}>
      <div className="join-item card card-border bg-base-100 dark:bg-tw-body flex flex-row gap-3 p-3">
        <div className="avatar my-1">
          <div className="size-12 rounded">
            <UserAvatar src={user.avatarUrl ?? defaultAvatarUrl} />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="truncate font-semibold">{ user.displayName }</p>
          <p className="text-gray-500 truncate">@{ user.screenName }</p>
          <p>{ user.bio }</p>
        </div>
      </div>
    </Link>
  )
}
import Link from "next/link";
import UserAvatar from "./header/user-avatar";
import { auth, signOut } from "@/auth";
import TweetButton from "./header/tweet-button";
import { defaultAvatarUrl } from "@/consts/account";

export default async function Header() {
  const session = await auth();

  return (
    <div className="w-screen bg-base-100 dark:bg-tw-header shadow-sm">
      <div className="navbar w-full lg:max-w-5xl mx-auto">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">Nestter</Link>
        </div>
        <div className="flex-none w-fit px-2">
          { session?.user.screenName ? <ProfileMenu avatarUrl={session.user.avatarUrl} screenName={session?.user.screenName} /> : <LogInMenu /> }
        </div>
      </div>
    </div>
  )
}

function LogInMenu() {
  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <Link href="/signup">ログイン</Link>
      </li>
    </ul>
  )
}

type ProfileMenuProps = {
  avatarUrl?: string;
  screenName: string;
}

function ProfileMenu({ screenName, avatarUrl }: ProfileMenuProps) {
  const u = avatarUrl || defaultAvatarUrl;

  async function onClickSignOut() {
    "use server";
    await signOut();
  }

  return (
    <div className="flex flex-row gap-2">
      <TweetButton />
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <UserAvatar src={u} />
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li>
            <Link href={`/user/${screenName}`}>
              プロフィール
            </Link>
          </li>
          <li>
            <Link href="/settings">
              設定
            </Link>
          </li>
          <li><a onClick={onClickSignOut}>ログアウト</a></li>
        </ul>
      </div>
    </div>
  )
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { defaultAvatarUrl } from '@/consts/account';
import { getUserByScreenName } from "@/app/action/account";
import UserTweets from '@/components/user-tweets';
import { formatJoinedDate } from "@/utils/date-util";
import { removeProtocol } from '@/utils/string-util';

type Props = {
  params: Promise<{ name: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const name = (await params).name
 
  const user = await getUserByScreenName(name);
  if (!user) {
    return {};
  }
 
  return {
    title: `${user.displayName} (@${user.screenName})`,
    description: user.bio,
    openGraph: {
      title: `${user.displayName} (@${user.screenName})`,
      description: user.bio ?? undefined,
      url: `https://nest.mgcup.net/user/${user.screenName}`,
      siteName: "Nestter",
      type: "website",
    }
  }
}

export default async function Profile({ params }: Props) {
  const { name } = await params;
  const user = await getUserByScreenName(name);

  if (!user) {
    return (
      <div className="flex flex-col items-center py-4">
        <p>This user does not exist.</p>
      </div>
    )
  }

  const session = await auth();
  const isMe = session?.user.screenName === user.screenName;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-screen lg:w-lg">
        <div className="w-[90vw] lg:w-full mx-auto">
          <div className="flex flex-row justify-between items-end">
            <div className="avatar">
              <div className="w-24 rounded ring-gray-300 ring-offset-white ring ring-offset-2">
                {/* eslint-disable-next-line */}
                <img
                  src={user.avatarUrl ?? defaultAvatarUrl}
                  alt="Avatar of user"
                  width={128}
                  height={128}
                />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              { isMe && (
                <Link
                  href={`/user/${user.screenName}/edit`}
                  className="btn btn-outline"
                >
                  編集
                </Link>
              )}
            </div>
          </div>
          <h2 className="mt-4">
            <span className="text-2xl font-semibold">{ user.displayName }</span>
          </h2>
          <p className="text-gray-500">@{ user.screenName }</p>
          <p className="mt-2">
            { user.bio }
          </p>
          <div className="text-gray-500 mt-4">
            { (user.website || user.location) && (
              <div className="flex flex-row gap-4 w-full">
                { user.location && (
                  <div className="flex flex-row items-center gap-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                    </svg>
                    <p className="truncate text-sm">{ user.location }</p>
                  </div>
                ) }
                { user.website && (
                  <div className="flex flex-row items-center gap-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
                    </svg>
                    <p className="truncate text-sm text-blue-500">
                      <a href={user.website} target="_blank" rel="noopener noreferrer">
                        { removeProtocol(user.website) }
                      </a>
                    </p>
                  </div>
                ) }
              </div>
            ) }
            <div className="flex flex-row items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-[1em]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
              <p className="text-sm">{ formatJoinedDate(user.createdAt) }</p>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-4">
          <UserTweets userId={user.id} />
        </div>
      </div>
    </div>
  )
}
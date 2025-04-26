import type { Metadata } from 'next'
import { defaultAvatarUrl } from '@/consts/account';
import { getUserByScreenName } from "@/app/action/account";
import UserTweets from '@/components/user-tweets';
import { formatJoinedDate } from "@/utils/date-util";

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
      description: user.bio ?? '',
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

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-screen lg:w-lg">
        <div className="w-[90vw] lg:w-full mx-auto">
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
          <h2 className="mt-4">
            <span className="text-2xl font-semibold">{ user.displayName }</span>
          </h2>
          <p className="text-gray-500">@{ user.screenName }</p>
          <p className="mt-2">
            { user.bio }
          </p>
          <div className="text-gray-500 mt-4">
            <div className="flex flex-row gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
              <p>{ formatJoinedDate(user.createdAt) }</p>
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
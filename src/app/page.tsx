import { redirect } from 'next/navigation';
import { auth } from "@/auth";
import { hasFollowingUser } from '@/app/action/follow';
import TimelineTabs from '@/components/timeline-tabs';

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.user.screenName) {
    redirect("/signup");
  }
  const sesUserId = session?.user ? Number(session.user.id) : undefined;
  const hasFollowing = await hasFollowingUser(sesUserId);

  return (
    <div className="flex flex-col items-center pb-4 lg:pt-4">
      <div className="w-screen lg:w-lg">
        <TimelineTabs hasFollowing={hasFollowing} authUserId={sesUserId} />
      </div>
    </div>
  );
}
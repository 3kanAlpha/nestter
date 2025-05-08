import { getFollowings } from "@/app/action/follow";
import UserCard from "@/components/user/user-card";

type Props = {
  userId: number;
}

export default async function FollowingList({ userId }: Props) {
  const followings = await getFollowings(userId);

  if (followings.length === 0) {
    return (
      <p className="p-2">フォローしているアカウントはありません</p>
    );
  }

  return (
    <div className="join join-vertical w-full">
      { followings.map((e) => <UserCard key={e.id} user={e} />) }
    </div>
  )
}
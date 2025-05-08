import { getTweetLikedUsers } from "@/app/action/favorite";
import UserCard from "@/components/user/user-card";

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
                { likedUsers.map((e) => <UserCard key={e.id} user={e} />) }
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
import { getUserByScreenName } from "@/app/action/account";
import FollowTabs from "@/components/user/follow/follow-tabs";

type Props = {
  params: Promise<{ name: string }>
}

export default async function UserFollow({ params }: Props) {
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
    <div className="flex flex-col items-center pb-4 lg:pt-4">
      <div className="w-screen lg:w-lg">
        <FollowTabs userId={user.id} />
      </div>
    </div>
  )
}
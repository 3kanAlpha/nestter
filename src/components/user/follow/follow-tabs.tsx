import FollowingList from "./following-list";
import FollowerList from "./follower-list";

type Props = {
  userId: number;
}

export default function FollowTabs({ userId }: Props) {
  return (
    <div className="tabs tabs-border flex">
      <input type="radio" name="user-follow-tabs" className="tab flex-auto" aria-label="フォロー中" defaultChecked />
      <div className="tab-content">
        <FollowingList userId={userId} />
      </div>

      <input type="radio" name="user-follow-tabs" className="tab flex-auto" aria-label="フォロワー" />
      <div className="tab-content">
        <FollowerList userId={userId} />
      </div>
    </div>
  )
}
"use client";
import { Suspense, useState } from "react";
import TweetList from "@/components/tweet-list";
import LikedTweetList from "@/components/tweet/liked-tweet-list";

type Props = {
  user: {
    id: number;
    screenName: string;
  };
  authUserId?: number;
}

export default function UserTabs({ user, authUserId }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="tabs tabs-border">
      <input type="radio" name="user_page_tabs" className="tab" aria-label="ツイート" onClick={()=>setActive(0)} defaultChecked />
      <div className="tab-content">
        { active === 0 && (
          <Suspense>
            <TweetList from={user.screenName} authUserId={authUserId} excludeReply />
          </Suspense>
        ) }
      </div>

      <input type="radio" name="user_page_tabs" className="tab" aria-label="ツイートと返信" onClick={()=>setActive(1)} />
      <div className="tab-content">
        { active === 1 && (
          <Suspense>
            <TweetList from={user.screenName} authUserId={authUserId} />
          </Suspense>
        ) }
      </div>

      <input type="radio" name="user_page_tabs" className="tab" aria-label="いいね" onClick={()=>setActive(2)} />
      <div className="tab-content">
        { active === 2 && (
          <Suspense>
            <LikedTweetList authUserId={authUserId} userId={user.id} />
          </Suspense>
        ) }
      </div>
    </div>
  )
}
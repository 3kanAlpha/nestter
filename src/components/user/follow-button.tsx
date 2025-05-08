"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { followUser, unfollowUser } from "@/app/action/follow";

type Props = {
  followeeId: number;
  isFollowed: boolean;
}

export default function FollowButton({ followeeId, isFollowed }: Props) {
  const router = useRouter();
  const [localFollowed, setLocalFollowed] = useState(isFollowed);

  const dialogId = "user-unfollow-confirm";

  async function handleFollow() {
    setLocalFollowed(true);
    await followUser(followeeId);
    router.refresh();
  }

  function handleModalOpen() {
    const confirmDialog = document.querySelector(`dialog#${dialogId}`);
    if (confirmDialog) {
      confirmDialog.showModal();
    }
  }

  async function handleUnfollow() {
    await unfollowUser(followeeId);
    setLocalFollowed(false);
    router.refresh();
  }

  if (localFollowed) {
    return (
      <>
        <button className="btn btn-outline w-32" onClick={handleModalOpen}>
          フォロー中
        </button>
        <dialog id={dialogId} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">フォローの解除</h3>
            <p className="pt-4">本当にフォローを解除しますか？</p>
            <div className="modal-action">
              <form method="dialog">
                <div className="flex flex-row gap-2">
                  <button className="btn btn-outline">キャンセル</button>
                  <button className="btn btn-primary" onClick={handleUnfollow}>フォロー解除</button>
                </div>
              </form>
            </div>
          </div>
        </dialog>
      </>
    );
  } else {
    return (
      <button className="btn w-32 dark:bg-white dark:text-black" onClick={handleFollow}>
        フォローする
      </button>
    );
  }
}
"use client";
import { usePathname, useRouter } from 'next/navigation';
import { retweet, undoRetweet } from '@/app/action/retweet';
import { PREVENT_NAVIGATION_CLASS } from "@/consts/layout";

type Props = {
  tweetId: number;
  retweetCount: number;
  isRetweeted: boolean;
  auth: boolean;
}

export default function RetweetButton({ tweetId, retweetCount, isRetweeted, auth }: Props) {
  const retweetDialogId = `tweet-card-${tweetId}-retweet-dialog`;
  const undoRetweetDialogId = `tweet-card-${tweetId}-undo-retweet-dialog`;

  const pathname = usePathname();
  const router = useRouter();

  function handleClick() {
    if (isRetweeted) {
      const undoDialog = document.querySelector(`dialog#${undoRetweetDialogId}`);
      if (undoDialog) {
        undoDialog.showModal();
      }
    } else {
      const retweetDialog = document.querySelector(`dialog#${retweetDialogId}`);
      if (retweetDialog) {
        retweetDialog.showModal();
      }
    }
  }

  async function handleRetweet() {
    await retweet(tweetId);
    router.refresh();
    router.push(pathname);
  }

  async function handleUndoRetweet() {
    await undoRetweet(tweetId);
    router.refresh();
    router.push(pathname);
  }

  return (
    <>
      <button
        className={`flex flex-row items-center gap-1 w-6 ${isRetweeted ? "text-green-500" : ""} ${PREVENT_NAVIGATION_CLASS}`}
        onClick={auth ? handleClick : undefined}
        disabled={!auth}
      >
        <ArrowPathOutline />
        <p className="text-xs">{ retweetCount > 0 && `${retweetCount}`}</p>
      </button>
      <dialog id={retweetDialogId} className="modal">
        <div className="modal-box text-black dark:text-white" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-lg">リツイート</h3>
          <p className="pt-4">リツイートしますか？</p>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex flex-row gap-2">
                <button className="btn btn-outline">キャンセル</button>
                <button
                  className="btn btn-primary"
                  onClick={handleRetweet}
                >リツイート</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
      <dialog id={undoRetweetDialogId} className="modal">
        <div className="modal-box text-black dark:text-white" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-lg">リツイートの取り消し</h3>
          <p className="pt-4">リツイートを取り消しますか？</p>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex flex-row gap-2">
                <button className="btn btn-outline">キャンセル</button>
                <button
                  className="btn btn-primary"
                  onClick={handleUndoRetweet}
                >取り消し</button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

function ArrowPathOutline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
    </svg>
  );
}
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TweetForm from '@/components/tweet/tweet-form';
import { PREVENT_NAVIGATION_CLASS } from "@/consts/layout";

type Props = {
  replyTo: {
    id: number;
    screenName: string;
  }
  replyCount: number;
  auth: boolean;
}

export default function ReplyButton({ replyTo, replyCount, auth }: Props) {
  const dialogId = `tweet-card-${replyTo.id}-reply-dialog`;

  const router = useRouter();

  const [formKey, setFormKey] = useState(0);

  function handleClick() {
    const params = new URLSearchParams();
    params.set("replyTo", replyTo.id.toString());
    router.push(`/mobile/new?${params.toString()}`);
  }

  function handleClickDesktop() {
    setFormKey(formKey + 1);
    const replyDialog = document.querySelector(`dialog#${dialogId}`);
    if (replyDialog) {
      replyDialog.showModal();
    }
  }

  function handleClose() {
    const replyDialog = document.querySelector(`dialog#${dialogId}`);
      if (replyDialog) {
        replyDialog.close();
      }
  }

  return (
    <>
      <button
        className={`flex lg:hidden flex-row items-center gap-1 w-6 ${PREVENT_NAVIGATION_CLASS}`}
        onClick={auth ? handleClick : undefined}
        disabled={!auth}
      >
        <ChatOutline />
        <p className="text-xs">{ replyCount > 0 && `${replyCount}`}</p>
      </button>
      <button
        className={`hidden lg:flex flex-row items-center gap-1 w-6 ${PREVENT_NAVIGATION_CLASS}`}
        onClick={auth ? handleClickDesktop : undefined}
        disabled={!auth}
      >
        <ChatOutline />
        <p className="text-xs">{ replyCount > 0 && `${replyCount}`}</p>
      </button>
      <dialog id={dialogId} className="modal">
        <div className="modal-box text-black dark:text-white" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-circle mb-2"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <TweetForm key={formKey} replyTo={replyTo} />
        </div>
      </dialog>
    </>
  )
}

function ChatOutline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
    </svg>
  )
}
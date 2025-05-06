"use client";
import { usePathname } from "next/navigation";
import { PREVENT_NAVIGATION_CLASS } from "@/consts/layout";

type Props = {
  tweetId: number;
}

export default function ShareButton({ tweetId }: Props) {
  const pathname = usePathname();
  const inDetailPage = pathname.match(/^\/post\/\d+$/g) != null;
  const menuVPos = inDetailPage ? "dropdown-top" : "";

  const copyLinkToClipboard = async () => {
    try {
      const postUrl = `https://nest.mgcup.net/post/${tweetId}`;
      await navigator.clipboard.writeText(postUrl);
    } catch (err) {
      console.error('URLのコピーに失敗しました', err);
    }
  }

  return (
    <div className={`dropdown dropdown-end ${menuVPos} ${PREVENT_NAVIGATION_CLASS}`}>
      <div tabIndex={0} role="button">
        <ShareOutline />
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-42 mt-1 p-2 shadow-sm text-xs text-black dark:text-white">
        <li>
          <button
            className="flex flex-row items-center gap-2"
            onClick={async () => {
              await copyLinkToClipboard();
              if (document.activeElement) {
                // メニューを閉じる
                (document.activeElement as HTMLElement).blur();
              }
            }}
          >
            <LinkOutline />
            リンクをコピー
          </button>
        </li>
      </ul>
    </div>
  )
}

function ShareOutline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}

function LinkOutline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}
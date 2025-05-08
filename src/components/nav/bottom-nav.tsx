"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  screenName: string;
}

export default function BottomNavigation({ screenName }: Props) {
  const pathname = usePathname();
  
  if (pathname.startsWith(`/user/${screenName}/`) || pathname === `/user/${screenName}`) {
    return <Dock choice={2} screenName={screenName} />;
  } else {
    return <Dock choice={0} screenName={screenName} />;
  }
}

function Dock({ choice, screenName }: {
  choice: number;
  screenName: string;
}) {
  return (
    <div className="dock dock-sm z-20">
      <Link href="/" className={choice === 0 ? "dock-active" : ""}>
        <HomeSolid />
        <span className="dock-label">Home</span>
      </Link>
      
      <button className={choice === 1 ? "dock-active" : ""} disabled>
        <InboxSolid />
        <span className="dock-label">Inbox</span>
      </button>
      
      <Link href={`/user/${screenName}`} className={choice === 2 ? "dock-active" : ""}>
        <UserSolid />
        <span className="dock-label">Profile</span>
      </Link>
    </div>
  )
}

function HomeSolid() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[1.2em]">
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  );
}

function InboxSolid() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[1.2em]">
      <path fillRule="evenodd" d="M6.912 3a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H6.912Zm13.823 9.75-2.213-7.191A1.5 1.5 0 0 0 17.088 4.5H6.912a1.5 1.5 0 0 0-1.434 1.059L3.265 12.75H6.11a3 3 0 0 1 2.684 1.658l.256.513a1.5 1.5 0 0 0 1.342.829h3.218a1.5 1.5 0 0 0 1.342-.83l.256-.512a3 3 0 0 1 2.684-1.658h2.844Z" clipRule="evenodd" />
    </svg>
  );
}

function UserSolid() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  );
}


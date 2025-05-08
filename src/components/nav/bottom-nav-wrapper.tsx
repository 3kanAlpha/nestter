import { auth } from "@/auth";
import BottomNavigation from "./bottom-nav";

export default async function BottomNavigationWrapper() {
  const session = await auth();

  return (
    <BottomNavigation screenName={session?.user.screenName ?? "_"} />
  );
}
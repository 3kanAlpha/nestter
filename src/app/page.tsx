import { redirect } from 'next/navigation';
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user && !session.user.screenName) {
    redirect("/signup");
  }

  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-2">
        <span className="text-3xl font-semibold">Nestter</span>
      </h2>
      <p className="mb-2">Nestterは準備中です……アカウント登録をしてお待ちください！</p>
    </div>
  );
}

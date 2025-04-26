import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignupForm from "@/components/signup/signup-form";

export default async function Signup() {
  const session = await auth();
  // 既にアカウントの初期設定が終わっているなら、リダイレクトする
  if (session?.user && session.user.screenName) {
    redirect(`/user/${session.user.screenName}`)
  }

  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-2">
        <span className="text-3xl font-semibold">新規登録</span>
      </h2>
      <SignupForm />
    </div>
  )
}
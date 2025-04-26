import type { Metadata } from 'next'

import { signIn } from "@/auth"

export const metadata: Metadata = {
  title: "ログイン",
}

export default function Login() {
  return (
    <div className="flex flex-col items-center p-4">
      <form
        action={async () => {
          "use server"
          await signIn("discord")
        }}
      >
        <button type="submit" className="btn btn-primary">Signin with Discord</button>
      </form>
    </div>
  )
}
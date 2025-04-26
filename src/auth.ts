import NextAuth, { type DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord"
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** Joined date */
      createdAt: string
      bio?: string
      screenName?: string
      displayName?: string
      avatarUrl?: string
      website?: string
      location?: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Create a `Pool` inside the request handler.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    adapter: NeonAdapter(pool),
    providers: [Discord],
    callbacks: {
      authorized: async ({ auth }) => {
        // Logged in users are authenticated, otherwise redirect to login page
        return !!auth
      },
      session({ session }) {
        return {
          ...session,
          user: {
            ...session.user,
          }
        }
      },
    },
  }
})
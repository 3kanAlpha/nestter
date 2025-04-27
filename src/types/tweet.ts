import type { SelectTweet } from "@/db/schema";

export type JoinedTweet = {
  tweet: SelectTweet;
  user: {
    id: number;
    screenName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  }
}
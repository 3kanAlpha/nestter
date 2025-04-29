import type { SelectTweet } from "@/db/schema";

export type JoinedTweet = {
  tweet: SelectTweet;
  user: {
    id: number;
    screenName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
  attachment: {
    id: number;
    fileUrl: string;
    mimeType: string | null;
    isSpoiler: boolean;
    width: number;
    height: number;
  } | null;
  engagement: {
    isFaved: boolean;
    favedTimestamp: string;
  } | null;
}
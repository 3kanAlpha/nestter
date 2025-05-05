import type { SelectTweet } from "@/db/schema";

export type User = {
  id: number;
  screenName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export type Attachment = {
  id: number;
  fileUrl: string;
  mimeType: string | null;
  isSpoiler: boolean;
  width: number;
  height: number;
}

export type Engagement = {
  isFaved: boolean;
  favedTimestamp: string | null;
  isRetweeted: boolean;
  retweetedTimestamp: string | null;
  parentFaved?: boolean;
  parentRetweeted?: boolean;
}

export type JoinedTweet = {
  tweet: SelectTweet;
  user: User;
  attachment: Attachment | null;
  engagement: Engagement | null;
  replyTweet: SelectTweet | null;
  replyUser: User | null;
  replyAttachment: Attachment | null;
  retweetTweet?: SelectTweet | null;
  retweetUser?: User | null;
  retweetAttachment?: Attachment | null;
}
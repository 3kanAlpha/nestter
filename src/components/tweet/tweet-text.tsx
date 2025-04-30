import Link from "next/link";
import { isValidHashtag, removeProtocol } from "@/utils/string-util";

type Props = {
  textContent: string;
}

export default function TweetText({ textContent }: Props) {
  const parts = textContent.split(/(\s+)/).map((part, i) => {
    // URL検出
    if (/^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/.test(part)) {
      return (
        <a key={i} href={part} className="text-blue-500 hover:underline wrap-anywhere" target="_blank" rel="noopener noreferrer">
          {removeProtocol(part)}
        </a>
      );
    }
    // メンション検出
    if (/^@\w+$/.test(part)) {
      const username = part.slice(1); // @を取る
      return (
        <Link key={i} href={`/user/${username}`}>
          <span className="text-blue-500 hover:underline wrap-anywhere">{part}</span>
        </Link>
      );
    }

    // ハッシュタグ検出
    if (part.startsWith("#") && isValidHashtag(part.slice(1))) {
      return (
        <Link key={i} href={{
          pathname: "/search",
          query: {
            q: part,
          },
        }}>
          <span className="text-blue-500 hover:underline wrap-anywhere">{part}</span>
        </Link>
      );
    }

    // それ以外は普通に表示
    return part;
  });

  return parts;
}
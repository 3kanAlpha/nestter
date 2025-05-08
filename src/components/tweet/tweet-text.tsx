import Link from "next/link";
import { isValidHashtag, removeProtocol, truncateString } from "@/utils/string-util";

type Props = {
  textContent: string;
  noLink?: boolean;
}

export default function TweetText({ textContent, noLink = false }: Props) {
  const parts = textContent.split(/(\s+)/).map((part, i) => {
    // URL検出
    if (/^https?:\/\/[\w/:%#\$&@\?\(\)~\.=\+\-]+$/.test(part)) {
      const urlText = truncateString(removeProtocol(part), 25);
      if (noLink) {
        return (
          <span key={i} className="text-blue-500 wrap-anywhere">
            {urlText}
          </span>
        )
      } else {
        return (
          <a key={i} href={part} className="text-blue-500 hover:underline wrap-anywhere" target="_blank" rel="noopener noreferrer">
            {urlText}
          </a>
        );
      }
    }
    // メンション検出
    if (/^@\w+$/.test(part)) {
      const username = part.slice(1); // @を取る
      if (noLink) {
        return (
          <span key={i} className="text-blue-500 wrap-anywhere">{part}</span>
        )
      } else {
        return (
          <Link key={i} href={`/user/${username}`}>
            <span className="text-blue-500 hover:underline wrap-anywhere">{part}</span>
          </Link>
        );
      }
    }

    // ハッシュタグ検出
    if (part.startsWith("#") && isValidHashtag(part.slice(1))) {
      if (noLink) {
        return (
          <span key={i} className="text-blue-500 wrap-anywhere">{part}</span>
        )
      } else {
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
    }

    // それ以外は普通に表示
    return part;
  });

  return parts;
}
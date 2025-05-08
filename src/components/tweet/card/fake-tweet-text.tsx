import { isValidHashtag, removeProtocol, truncateString } from "@/utils/string-util";

type Props = {
  textContent: string;
}

export default function FakeTweetText({ textContent }: Props) {
  const parts = textContent.split(/(\s+)/).map((part, i) => {
    // URL検出
    if (/^https?:\/\/[\w/:%#\$&@\?\(\)~\.=\+\-]+$/.test(part)) {
      return (
        <a
          key={i}
          href={part}
          className="text-blue-500 hover:underline wrap-anywhere"
          target="_blank"
          rel="noopener noreferrer"
        >
          {truncateString(removeProtocol(part), 25)}
        </a>
      );
    }
    // メンション検出
    if (/^@\w+$/.test(part)) {
      const username = part.slice(1); // @を取る
      return (
        <a
          key={i}
          href={`https://x.com/${username}`}
          className="text-blue-500 hover:underline wrap-anywhere"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{part}</span>
        </a>
      );
    }

    // ハッシュタグ検出
    if (part.startsWith("#") && isValidHashtag(part.slice(1))) {
      const rawHashtag = part.slice(1);
      return (
        <a
          key={i}
          href={`https://x.com/hashtag/${encodeURIComponent(rawHashtag)}`}
          className="text-blue-500 hover:underline wrap-anywhere"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{part}</span>
        </a>
      );
    }

    // それ以外は普通に表示
    return part;
  });

  return parts;
}
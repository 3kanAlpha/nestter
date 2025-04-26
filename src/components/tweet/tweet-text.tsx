import Link from "next/link";

type Props = {
  textContent: string;
}

export default function TweetText({ textContent }: Props) {
  const parts = textContent.split(/(\s+)/).map((part, i) => {
    // URL検出
    if (/^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/.test(part)) {
      return (
        <a key={i} href={part} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    // メンション検出
    if (/^@\w+$/.test(part)) {
      const username = part.slice(1); // @を取る
      return (
        <Link key={i} href={`/user/${username}`}>
          <span className="text-blue-500 hover:underline">{part}</span>
        </Link>
      );
    }
    // それ以外は普通に表示
    return part;
  });

  return parts;
}
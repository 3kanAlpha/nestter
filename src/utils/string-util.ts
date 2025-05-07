function getCharWidth(s: string): number {
  const codePoint = s.codePointAt(0);
  if (!codePoint) {
    return 0;
  }

  if (codePoint <= 0x7f) {
    // ASCII
    return 1;
  }
  return 2;
}

/** 文字列の長さを計算する */
export function getStringLength(text: string): number {
  const codePoints = [...text];
  const widthSum = codePoints.reduce((acc, value) => acc + getCharWidth(value), 0);
  return widthSum;
}

export function removeProtocol(urlText: string): string {
  if (urlText.startsWith("http://")) {
    return urlText.replace("http://", "");
  } else if (urlText.startsWith("https://")) {
    return urlText.replace("https://", "");
  }

  return urlText;
}

/** 与えられた文字列がハッシュタグの条件を満たすか判定する */
export function isValidHashtag(text: string): boolean {
  if (text.length === 0 || text.length > 50) {
    return false;
  }

  const alnumPattern = /^\w+$/g;
  const decimalPattern = /^\d+$/g;
  if (alnumPattern.test(text) && !decimalPattern.test(text)) {
    return true;
  }

  // ひらがな: 3040–309F
  // カタカナ: 30A0–30FF
  // 漢字: 4E00–9FCF
  const japanesePattern = /^[\w\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u4e00-\u9fcf\u301c]+$/g;
  return japanesePattern.test(text);
}

/** 文字列に含まれるURLのうち、最初のものを返す */
export function extractFirstUrl(text: string): string | null {
  // 簡単なURL判定の正規表現
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}
export function getStringLength(text: string): number {
  return [...text].length;
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
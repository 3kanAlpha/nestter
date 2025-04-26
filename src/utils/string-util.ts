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
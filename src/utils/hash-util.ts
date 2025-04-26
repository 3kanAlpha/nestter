/** 与えられた文字列からSHA-256ハッシュ値を計算する */
export async function calcDigest(text: string): Promise<string> {
  const uint8  = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
}
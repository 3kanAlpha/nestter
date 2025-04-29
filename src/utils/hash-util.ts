/** 与えられた文字列からSHA-256ハッシュ値を計算する */
export async function calcDigest(text: string): Promise<string> {
  const uint8  = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
}

/** バッファからSHA-256ハッシュ値を計算する */
export async function calcDigestFromBuffer(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
}

/** Uint8ArrayからSHA-256ハッシュ値を計算する */
export async function calcDigestFromUint8Array(source: Uint8Array) {
  const digest = await crypto.subtle.digest('SHA-256', source);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
}
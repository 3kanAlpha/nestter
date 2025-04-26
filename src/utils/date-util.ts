export function formatJoinedDate(timestamp: string): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const month = d.getMonth() + 1;

  return `${y}年${month}月からNestterを利用しています`;
}
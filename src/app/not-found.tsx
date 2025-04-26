import Link from 'next/link';

export const runtime = 'edge';
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-4">
      <h2 className="mb-4">
        <span className="text-2xl font-semibold">Not Found</span>
      </h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}
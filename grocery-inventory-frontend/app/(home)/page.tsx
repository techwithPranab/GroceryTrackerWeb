import { redirect } from 'next/navigation';

// The home page content lives at app/page.tsx.
// This file exists only to satisfy Next.js route group layout scoping.
export default function HomeGroupPage() {
  redirect('/');
}

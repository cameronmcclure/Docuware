import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to DocuMate</h1>
      <p>This is the home page. Click below to sign in.</p>
      <Link href="/login" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Go to Login
      </Link>
    </main>
  );
}
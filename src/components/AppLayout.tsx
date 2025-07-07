'use client';

import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">DocuMate</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/invoices">Invoices</Link>
          <Link href="/inventory">Inventory</Link>
          <Link href="/service-calls">Service Calls</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/logout">Logout</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
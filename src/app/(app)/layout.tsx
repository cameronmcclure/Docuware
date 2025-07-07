import '../globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'DocuMate',
  description: 'Simple field service SaaS tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-100 border-r p-4 space-y-4 text-sm">
          <h2 className="text-xl font-bold mb-6">DocuMate</h2>
          <nav className="space-y-2">
            <NavItem href="/dashboard" label="Dashboard" />
            <NavItem href="/customers" label="Customers" />
            <NavItem href="/invoices" label="Invoices" />
            <NavItem href="/inventory" label="Inventory" />
            <NavItem href="/service-calls" label="Service Calls" />
            <NavItem href="/messages" label="Messages" />
            <NavItem href="/settings" label="Settings" />
            <NavItem href="/login" label="Logout" />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-2 py-1 rounded hover:bg-blue-100">
      {label}
    </Link>
  );
}
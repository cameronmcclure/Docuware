'use client';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome back, Cameron :)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500">Customers</p>
          <p className="text-xl font-bold">12</p>
        </div>
        <div className="border p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500">Invoices Due</p>
          <p className="text-xl font-bold">$3,210</p>
        </div>
        <div className="border p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500">Jobs Scheduled</p>
          <p className="text-xl font-bold">7</p>
        </div>
      </div>
    </div>
  );
}
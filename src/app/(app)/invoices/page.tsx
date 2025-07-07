'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Invoice {
  id: string;
  customer_id: string;
  due_date: string;
  payment_status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<'due_date' | 'payment_status' | 'customer'>('due_date');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*');

    if (data) setInvoices(data);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, name');

    if (data) setCustomers(data);
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    return customer?.name || '—';
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    let valA, valB;

    if (sortKey === 'customer') {
      valA = getCustomerName(a.customer_id);
      valB = getCustomerName(b.customer_id);
    } else {
      valA = a[sortKey];
      valB = b[sortKey];
    }

    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + New Invoice
        </Link>
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th
                className="p-2 border cursor-pointer"
                onClick={() => handleSort('customer')}
              >
                Customer {sortKey === 'customer' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => handleSort('payment_status')}
              >
                Status {sortKey === 'payment_status' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                className="p-2 border cursor-pointer"
                onClick={() => handleSort('due_date')}
              >
                Due Date {sortKey === 'due_date' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="p-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => router.push(`/invoices/${inv.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-2 border">{getCustomerName(inv.customer_id)}</td>
                <td className="p-2 border">{inv.payment_status}</td>
                <td className="p-2 border">{inv.due_date}</td>
                <td className="p-2 border">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
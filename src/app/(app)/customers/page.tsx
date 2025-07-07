'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseSession } from '@/utils/supabaseSession';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const session = useSupabaseSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (session) fetchCustomers();
  }, [session]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      alert('Failed to load customers.');
    } else {
      setCustomers(data || []);
    }

    setLoading(false);
  };

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return alert('No session found.');

    setAdding(true);
    const { error } = await supabase.from('customers').insert([
      {
        user_id: session.user.id,
        name,
        email,
        phone,
        address,
      },
    ]);

    if (error) {
      alert('Error adding customer: ' + error.message);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      fetchCustomers();
    }

    setAdding(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <form onSubmit={addCustomer} className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`/customers/${c.id}`)}
                className="cursor-pointer hover:bg-gray-100 transition"
              >
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.email || '-'}</td>
                <td className="p-2 border">{c.phone || '-'}</td>
                <td className="p-2 border">{c.address || '-'}</td>
                <td className="p-2 border">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
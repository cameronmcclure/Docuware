'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCustomer(id as string);
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error fetching customer:', error.message);
      setCustomer(null);
    } else {
      setCustomer(data);
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>

      {loading ? (
        <p>Loading...</p>
      ) : !customer ? (
        <p>Customer not found.</p>
      ) : (
        <div className="space-y-2">
          <p><span className="font-semibold">Name:</span> {customer.name}</p>
          <p><span className="font-semibold">Email:</span> {customer.email || '-'}</p>
          <p><span className="font-semibold">Phone:</span> {customer.phone || '-'}</p>
          <p><span className="font-semibold">Address:</span> {customer.address || '-'}</p>
          <p><span className="font-semibold">Joined:</span> {new Date(customer.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
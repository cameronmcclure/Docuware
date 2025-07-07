'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Customer {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  taxable: boolean;
}

const generateInvoiceNumber = (count: number): string => {
  const padded = String(count + 1).padStart(5, '0');
  return `INV-${padded}`;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, discount: 0, taxable: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('id, name').order('name');
    if (data) setCustomers(data);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, discount: 0, taxable: false }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setLineItems(updatedItems);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number, field: keyof LineItem) => {
    const value =
      field === 'taxable' ? e.target.checked :
      field === 'quantity' || field === 'unit_price' || field === 'discount' ? parseFloat(e.target.value) :
      e.target.value;
    updateLineItem(index, field, value);
  };

  const calculateSubtotal = () => lineItems.reduce((sum, item) => {
    const discounted = item.unit_price * (1 - item.discount);
    return sum + discounted * item.quantity;
  }, 0);

  const calculateTax = () => {
    const taxRate = 0.08;
    return lineItems.reduce((total, item) => {
      if (item.taxable) {
        const discounted = item.unit_price * (1 - item.discount);
        total += discounted * item.quantity * taxRate;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDebug('Form submitted...');
    setSubmitting(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session response:', sessionData);
    if (sessionError || !sessionData?.session) {
      setDebug('Failed to get session.');
      setSubmitting(false);
      return;
    }

    await supabase.auth.setSession(sessionData.session);
    console.log('Session set. Current session:', sessionData.session);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    console.log('Current user:', user);
    setDebug((prev) => prev + ` | user: ${user?.id}`);

    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    const invoiceNumber = generateInvoiceNumber(count || 0);

    const { data: invoice, error } = await supabase.from('invoices').insert([{
      customer_id: customerId,
      due_date: dueDate,
      notes,
      payment_status: 'unpaid',
      delivery_method: 'email',
      invoice_number: invoiceNumber,
      user_id: user?.id
    }]).select().single();

    if (error || !invoice) {
      setDebug((prev) => prev + ` | Invoice creation failed: ${error?.message}`);
      setSubmitting(false);
      return;
    }

    const lineInsert = lineItems.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      taxable: item.taxable
    }));

    const { error: itemError } = await supabase.from('invoice_items').insert(lineInsert);
    if (itemError) {
      setDebug((prev) => prev + ` | Item insert failed: ${itemError.message}`);
    } else {
      setDebug((prev) => prev + ` | Invoice saved, redirecting...`);
      router.push('/invoices');
    }

    setSubmitting(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">New Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="p-2 border rounded w-full">
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-2 border rounded w-full" />
        <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="p-2 border rounded w-full" />
        <div>
          <h2 className="text-lg font-semibold mb-2">Line Items</h2>
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleChange(e, index, 'description')} className="p-2 border rounded" />
              <input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handleChange(e, index, 'quantity')} className="p-2 border rounded" />
              <input type="number" placeholder="Unit Price" value={item.unit_price} onChange={(e) => handleChange(e, index, 'unit_price')} className="p-2 border rounded" />
              <input type="number" placeholder="Discount (0-1)" step="0.01" value={item.discount} onChange={(e) => handleChange(e, index, 'discount')} className="p-2 border rounded" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={item.taxable} onChange={(e) => handleChange(e, index, 'taxable')} />
                <span>Taxable</span>
              </label>
            </div>
          ))}
          <button type="button" onClick={addLineItem} className="text-blue-600 underline">+ Add Line Item</button>
        </div>
        <div className="text-right">
          <p>Subtotal: ${calculateSubtotal().toFixed(2)}</p>
          <p>Tax: ${calculateTax().toFixed(2)}</p>
          <p className="text-xl font-bold">Total: ${(calculateSubtotal() + calculateTax()).toFixed(2)}</p>
        </div>
        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? 'Saving...' : 'Save Invoice'}
        </button>
        {debug && (
          <div className="bg-yellow-100 text-yellow-800 mt-6 p-3 rounded">
            Debug: {debug}
          </div>
        )}
      </form>
    </div>
  );
}
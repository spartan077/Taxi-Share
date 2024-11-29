import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface TaxiPricing {
  id: string;
  route_name: string;
  car_type: string;
  car_name: string;
  base_price: number;
  discount: number;
  final_price: number;
  toll_included: boolean;
  distance_km: number;
  max_passengers: number;
  created_at: string;
  updated_at: string;
}

export default function PricingManager() {
  const [pricing, setPricing] = useState<TaxiPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TaxiPricing>>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('taxi_pricing')
        .select('*')
        .order('route_name', { ascending: true });

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast.error('Failed to fetch pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: TaxiPricing) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;

    try {
      const { error } = await supabase
        .from('taxi_pricing')
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Pricing updated successfully');
      setEditingId(null);
      setEditForm({});
      fetchPricing();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  if (loading) {
    return <div className="text-center">Loading pricing data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Taxi Pricing Manager</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pricing.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      name="route_name"
                      value={editForm.route_name || ''}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.route_name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      name="car_type"
                      value={editForm.car_type || ''}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.car_type
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      name="car_name"
                      value={editForm.car_name || ''}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item.car_name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      name="base_price"
                      value={editForm.base_price || 0}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    `₹${item.base_price}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      name="discount"
                      value={editForm.discount || 0}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    `₹${item.discount}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      name="final_price"
                      value={editForm.final_price || 0}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    `₹${item.final_price}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === item.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm({});
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

export const useOrders = (driverId?: string, supplierId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          supplier:suppliers(*),
          driver:users(*)
        `)
        .order('created_at', { ascending: false });

      // Filter by driver if specified
      if (driverId) {
        query = query.eq('driver_id', driverId);
      }

      // Filter by supplier if specified
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'supplier' | 'driver'>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select(`
          *,
          supplier:suppliers(*),
          driver:users(*)
        `)
        .single();

      if (error) throw error;
      
      setOrders(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create order');
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          supplier:suppliers(*),
          driver:users(*)
        `)
        .single();

      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === id ? data : o));
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update order');
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    return updateOrder(orderId, { 
      driver_id: driverId, 
      status: 'assigned' as const 
    });
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updates: Partial<Order> = { status };
    
    // Set actual delivery time when delivered
    if (status === 'delivered') {
      updates.actual_delivery_time = new Date().toISOString();
    }

    return updateOrder(orderId, updates);
  };

  useEffect(() => {
    fetchOrders();
  }, [driverId, supplierId]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    assignDriver,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
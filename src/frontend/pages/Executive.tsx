import React, { useState, useEffect } from 'react';
import { Package, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { User, Order } from '../../types';

interface ExecutiveProps {
  user: User | null;
  setView: (view: any) => void;
}

export const Executive: React.FC<ExecutiveProps> = ({ user, setView }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/executive/orders', {
        headers: { 'Authorization': user?.token || '' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemPick = async (orderId: number, itemId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/executive/items/${itemId}/pick`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': user?.token || ''
        },
        body: JSON.stringify({ is_checked: !currentStatus })
      });
      if (res.ok) {
        // Optimistic update
        setOrders(prev => prev.map(o => {
          if (o.id === orderId && o.items) {
            return {
              ...o,
              items: o.items.map(item => item.id === itemId ? { ...item, is_checked: !currentStatus } : item)
            };
          }
          return o;
        }));
      }
    } catch (e) {
      console.error('Failed to pick item:', e);
    }
  };

  const markOrderPacked = async (orderId: number) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': user?.token || ''
        },
        body: JSON.stringify({ status: 'packed' })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
        console.error('Failed to mark packed:', e);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold">Loading Orders...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <Package className="text-emerald-600 dark:text-emerald-500" />
            Executive Packing Console
          </h2>
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <ArrowLeft size={20} /> Back to Store
          </button>
        </div>

        <div className="space-y-6">
          {orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'packed').map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Order #{order.id}</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{order.user_name}</p>
                   <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{(order as any).address}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'packed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold mt-1 dark:text-white">₹{order.total}</p>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Items to Pack</h4>
                <div className="space-y-3">
                  {order.items?.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItemPick(order.id, item.id, item.is_checked)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        item.is_checked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 opacity-75' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.is_checked ? (
                          <CheckCircle2 className="text-emerald-600 dark:text-emerald-500" size={24} />
                        ) : (
                          <Circle className="text-slate-300 dark:text-slate-700" size={24} />
                        )}
                        <div>
                          <p className={`font-bold ${item.is_checked ? 'line-through text-slate-500 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.product_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-400 dark:text-slate-600">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.status !== 'packed' && (
                <div className="px-6 pb-6 mt-2">
                  <button 
                    onClick={() => markOrderPacked(order.id)}
                    disabled={!order.items?.every(item => item.is_checked)}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      order.items?.every(item => item.is_checked) 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-black dark:hover:bg-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Mark as Packed
                  </button>
                  {!order.items?.every(item => item.is_checked) && (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-2">Pack all items to mark as completed</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <Package className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
               <p className="text-slate-500 dark:text-slate-400 font-medium">No pending orders for packing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

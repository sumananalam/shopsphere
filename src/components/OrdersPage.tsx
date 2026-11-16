import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Order, User } from '../types';

interface OrdersPageProps {
  user: User | null;
  onViewDetails: (productId: number) => void;
}

export default function OrdersPage({ user, onViewDetails }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-user-id': String(user?.id || 2) }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'Shipped':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Truck className="w-3.5 h-3.5" /> Shipped</span>;
      case 'Processing':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders & Tracking</h1>
        <p className="text-xs text-gray-600 mt-1">Review past purchases, monitor delivery statuses, and track your shipments</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm">
          <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No orders placed yet</h3>
          <p className="text-xs text-gray-600 mb-6">When you place orders, they will appear here with live tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden p-6 sm:p-8">
              
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-base font-black text-purple-900">{ord.order_number}</span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <p className="text-xs text-gray-500">Placed on {new Date(ord.created_at).toLocaleDateString()} • Tracking: <span className="font-bold text-gray-700">{ord.tracking_number}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-black text-gray-950">${ord.final_amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="py-6 space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ord.items?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onViewDetails(item.product_id)}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 cursor-pointer hover:bg-purple-50 transition"
                    >
                      <img src={item.primary_image} alt="" className="w-16 h-16 object-cover rounded-xl border border-purple-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-gray-900 truncate">{item.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address info */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-600 gap-2">
                <div>
                  <span className="font-bold text-gray-800">Shipping Address: </span>
                  {ord.address_line1}, {ord.city}, {ord.state}
                </div>
                <div>
                  <span className="font-bold text-gray-800">Payment: </span>
                  {ord.payment_method} ({ord.payment_status})
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

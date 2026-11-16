import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onProceedToCheckout: (subtotal: number, discount: number, couponCode: string) => void;
  cartUpdatedKey: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  userId,
  onProceedToCheckout,
  cartUpdatedKey
}: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, cartUpdatedKey, userId]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { 'x-user-id': String(userId) }
      });
      const data = await res.json();
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, newQty: number) => {
    try {
      await fetch(`/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid coupon');
      }
      setAppliedCoupon({ code: data.code, discount: data.discount });
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message);
    }
  };

  if (!isOpen) return null;

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 9.99;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-purple-300" />
            <h2 className="text-lg font-bold">Shopping Cart ({items.length})</h2>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading cart items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 mb-6">Explore our products and add items to your cart</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cart_item_id} className="flex gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <img
                  src={item.primary_image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border border-purple-200 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs font-black text-purple-900 mt-1">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-purple-200 rounded-lg bg-white overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      className="text-red-500 hover:text-red-700 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-4 shadow-lg">
            
            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Coupon code (e.g. PURPLE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs uppercase focus:outline-none focus:ring-1 focus:ring-purple-600 font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-900 text-white font-bold text-xs rounded-xl hover:bg-purple-950 transition"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <span>Coupon <b>{appliedCoupon.code}</b> applied!</span>
                <button onClick={() => setAppliedCoupon(null)} className="font-bold hover:underline">Remove</button>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-700">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-950 pt-2 border-t border-gray-100">
                <span>Final Total</span>
                <span className="text-purple-900">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout(subtotal, discountAmount, appliedCoupon ? appliedCoupon.code : '');
              }}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl shadow-xl shadow-purple-200 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

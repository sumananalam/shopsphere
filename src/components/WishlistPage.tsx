import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Product, User } from '../types';

interface WishlistPageProps {
  user: User | null;
  onAddToCart: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  onWishlistChange: () => void;
}

export default function WishlistPage({
  user,
  onAddToCart,
  onViewDetails,
  onWishlistChange
}: WishlistPageProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'x-user-id': String(user?.id || 2) }
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(user?.id || 2) }
      });
      fetchWishlist();
      onWishlistChange();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Saved Wishlist</h1>
        <p className="text-xs text-gray-600 mt-1">Manage your favorite products and move them to your cart anytime</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm">
          <div className="w-16 h-16 bg-purple-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-gray-600 mb-6">Click the heart icon on any product to save it to your wishlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden flex flex-col group">
              <div
                onClick={() => onViewDetails(p.id)}
                className="relative h-52 bg-purple-50 overflow-hidden cursor-pointer"
              >
                <img src={p.primary_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => onViewDetails(p.id)}
                    className="font-bold text-xs text-gray-900 line-clamp-2 cursor-pointer hover:text-purple-700 transition"
                  >
                    {p.name}
                  </h3>
                  <p className="text-base font-black text-gray-950 mt-2">${p.price.toFixed(2)}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(p.id);
                      removeFromWishlist(p.id);
                    }}
                    className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

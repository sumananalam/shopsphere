import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  isWishlisted = false
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100 overflow-hidden flex flex-col group relative">
      
      {/* Discount Badge */}
      {product.discount_percentage > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-pink-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow">
          {product.discount_percentage}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => onToggleWishlist(product.id)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition shadow ${
          isWishlisted
            ? 'bg-pink-500 text-white'
            : 'bg-white/80 text-gray-700 hover:bg-white hover:text-pink-600'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className="w-4 h-4 fill-current" />
      </button>

      {/* Image container */}
      <div
        onClick={() => onViewDetails(product.id)}
        className="relative h-52 sm:h-56 bg-purple-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(product.id); }}
            className="p-3 bg-white text-gray-900 rounded-xl shadow-lg hover:bg-purple-50 transition"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
            {product.category_name || product.brand}
          </span>
          <h3
            onClick={() => onViewDetails(product.id)}
            className="font-bold text-sm text-gray-900 line-clamp-2 mt-1 cursor-pointer hover:text-purple-700 transition"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold ml-1 text-gray-800">{product.rating}</span>
            </div>
            <span className="text-[11px] text-gray-600">({product.review_count})</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-gray-950">${product.price.toFixed(2)}</span>
              {product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold">{product.stock_status}</p>
          </div>

          <button
            onClick={() => onAddToCart(product.id)}
            className="p-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md shadow-purple-200 transition flex items-center gap-1.5"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

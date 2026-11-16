import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Check, Plus, Minus } from 'lucide-react';
import { Product, Review, User } from '../types';
import ProductCard from './ProductCard';

interface ProductDetailsProps {
  productId: number;
  user: User | null;
  onAddToCart: (productId: number, qty: number) => void;
  onToggleWishlist: (productId: number) => void;
  onViewDetails: (id: number) => void;
  onBuyNow: (productId: number, qty: number) => void;
  isWishlisted: boolean;
}

export default function ProductDetails({
  productId,
  user,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  onBuyNow,
  isWishlisted
}: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // New review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }

      // Fetch similar products in same category
      if (data.category_slug) {
        const simRes = await fetch(`/api/products?category=${data.category_slug}`);
        const simData = await simRes.json();
        setSimilarProducts(simData.filter((p: Product) => p.id !== data.id).slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to write a review');
      return;
    }
    setReviewSubmitting(true);
    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user.id)
        },
        body: JSON.stringify({ userId: user.id, rating: newRating, comment: newComment })
      });
      setNewComment('');
      fetchProductDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-purple-100">
        
        {/* Images */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[450px] rounded-2xl overflow-hidden bg-purple-50 border border-purple-100 shadow-inner">
            <img
              src={selectedImage || product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount_percentage > 0 && (
              <span className="absolute top-4 left-4 bg-pink-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img ? 'border-purple-700 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {product.category_name || product.brand}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 mb-3">{product.name}</h1>

            {/* Rating & Reviews count */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold ml-1 text-gray-900">{product.rating}</span>
              </div>
              <span className="text-xs text-gray-600 font-medium">{product.review_count} Verified Customer Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
              <span className="text-3xl font-black text-gray-950">${product.price.toFixed(2)}</span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {product.stock_status} ({product.stock_quantity} available)
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-gray-600 hover:bg-gray-100 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onAddToCart(product.id, quantity)}
                className="py-3.5 px-6 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(product.id, quantity)}
                className="py-3.5 px-6 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Buy Now ⚡
              </button>
            </div>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`w-full py-3 px-6 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-2 ${
                isWishlisted
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-purple-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-purple-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-purple-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">30-Day Returns</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs for Description, Specs, Reviews */}
      <div className="mt-12 bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-6 gap-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`py-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'desc' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'specs' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'reviews' ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Customer Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'desc' && (
            <div className="space-y-4 text-gray-700 text-sm leading-relaxed max-w-3xl">
              <p>{product.description}</p>
              <p>Engineered for maximum durability, premium aesthetics, and high-performance reliability. Backed by ShopSphere quality assurance standards.</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-xs">
              <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
                <span className="font-bold text-gray-700">Brand</span>
                <span className="text-gray-900 font-semibold">{product.brand}</span>
              </div>
              <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
                <span className="font-bold text-gray-700">Category</span>
                <span className="text-gray-900 font-semibold">{product.category_name}</span>
              </div>
              <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
                <span className="font-bold text-gray-700">Stock Status</span>
                <span className="text-emerald-700 font-semibold">{product.stock_status}</span>
              </div>
              <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
                <span className="font-bold text-gray-700">SKU</span>
                <span className="text-gray-900 font-semibold">PC-{product.id}-2026</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Write a Review Form */}
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Write a Customer Review</h3>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Rating:</span>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((r: Review) => (
                    <div key={r.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-gray-900">{r.user_name || 'Verified Buyer'}</span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Similar Products You Might Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(id) => onAddToCart(id, 1)}
                onToggleWishlist={onToggleWishlist}
                onViewDetails={onViewDetails}
                isWishlisted={false}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

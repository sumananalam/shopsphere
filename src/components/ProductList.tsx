import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  wishlistIds: number[];
}

export default function ProductList({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  wishlistIds
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [dealOnly, setDealOnly] = useState(false);
  const [sort, setSort] = useState('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, minRating, dealOnly, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('rating', minRating);
      if (dealOnly) params.append('deal', 'true');
      if (sort) params.append('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDealOnly(false);
    setSort('popularity');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-purple-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All Products Catalog'}
          </h1>
          <p className="text-xs text-gray-600 mt-1">Showing {products.length} verified items matching your criteria</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex-1 px-4 py-2.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-purple-200"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <span className="text-xs font-semibold text-gray-600 shrink-0">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200 text-gray-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold cursor-pointer w-full md:w-auto"
            >
              <option value="popularity">Popularity / Reviews</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-white p-6 rounded-3xl shadow-sm border border-purple-100 h-fit space-y-6`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-700" /> Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`block w-full text-left text-xs px-3 py-2 rounded-xl transition ${
                  !selectedCategory ? 'bg-purple-700 text-white font-bold' : 'text-gray-700 hover:bg-purple-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`block w-full text-left text-xs px-3 py-2 rounded-xl transition truncate ${
                    selectedCategory === c.slug ? 'bg-purple-700 text-white font-bold' : 'text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Price Range ($)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Customer Rating */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {['', '4.5', '4.0', '3.5'].map((r) => (
                <label key={r} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r}
                    onChange={() => setMinRating(r)}
                    className="text-purple-700 focus:ring-purple-600"
                  />
                  <span>{r ? `${r} Stars & Above` : 'All Ratings'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deals Only */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={dealOnly}
                onChange={(e) => setDealOnly(e.target.checked)}
                className="rounded text-purple-700 focus:ring-purple-600 w-4 h-4"
              />
              <span>⚡ Today's Deals & Discounts</span>
            </label>
          </div>

        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-purple-100 p-4">
                  <div className="bg-purple-100 h-44 rounded-xl mb-4"></div>
                  <div className="h-4 bg-purple-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-purple-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm">
              <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-xs text-gray-600 mb-6">Try adjusting your search terms or filter criteria</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-purple-700 text-white text-xs font-bold rounded-xl hover:bg-purple-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onViewDetails={onViewDetails}
                  isWishlisted={wishlistIds.includes(p.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

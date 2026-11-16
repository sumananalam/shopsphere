import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, User as UserIcon, MapPin, Menu, X, Shield, Package, LogOut, ChevronDown } from 'lucide-react';
import { User, Category } from '../types';

interface NavbarProps {
  user: User | null;
  categories: Category[];
  cartCount: number;
  wishlistCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenCart: () => void;
  onNavigate: (view: string, categorySlug?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}

export default function Navbar({
  user,
  categories,
  cartCount,
  wishlistCount,
  onOpenAuth,
  onLogout,
  onOpenCart,
  onNavigate,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('New York, 10001');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('shop');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white shadow-xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-purple-200 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/50 group-hover:scale-105 transition">
                <span className="text-white font-black text-2xl tracking-tighter">SS</span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                  ShopSphere
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-purple-300 font-semibold">
                  Prime E-Commerce
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <div
            onClick={() => setLocationModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 cursor-pointer hover:bg-purple-950/60 transition"
          >
            <MapPin className="w-4 h-4 text-purple-300 shrink-0" />
            <div className="text-xs">
              <p className="text-purple-300">Deliver to</p>
              <p className="font-bold text-white">{currentLocation}</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden sm:flex items-center">
            <div className="relative flex w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-purple-950/80 text-purple-200 text-xs px-3 rounded-l-xl border-y border-l border-purple-500/30 focus:outline-none focus:ring-1 focus:ring-purple-400 hidden md:block cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-white text-gray-900 px-4 py-2.5 text-sm md:rounded-r-xl sm:rounded-l-none rounded-l-xl focus:outline-none shadow-inner"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 rounded-r-xl transition flex items-center justify-center shadow-md"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-purple-200 hover:text-white transition flex items-center gap-1 group"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="w-6 h-6 group-hover:scale-110 transition" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-semibold">Wishlist</span>
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-purple-700/60 hover:bg-purple-700 text-white rounded-xl transition flex items-center gap-2 border border-purple-500/40 shadow-md group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-400 text-purple-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
            </button>

            {/* User Account Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 hover:bg-purple-900 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] text-purple-300">Hello, {user.name.split(' ')[0]}</p>
                    <p className="text-xs font-bold truncate max-w-[100px]">{user.role === 'admin' ? 'Admin ⚡' : 'Account'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { onNavigate('orders'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition"
                    >
                      <Package className="w-4 h-4 text-purple-600" /> My Orders & Tracking
                    </button>

                    <button
                      onClick={() => { onNavigate('wishlist'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition"
                    >
                      <Heart className="w-4 h-4 text-purple-600" /> My Wishlist
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2.5 transition border-y border-indigo-100"
                      >
                        <Shield className="w-4 h-4 text-indigo-600" /> Admin Dashboard
                      </button>
                    )}

                    <div className="pt-1 mt-1 border-t border-gray-100">
                      <button
                        onClick={() => { onLogout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition"
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-white text-purple-900 font-bold text-xs rounded-xl hover:bg-purple-100 transition shadow-md flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" /> Sign In
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Sub-Navbar Categories */}
      <nav className="bg-purple-950/80 border-t border-purple-800/40 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-11 text-xs font-medium">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => { setSelectedCategory(''); onNavigate('home'); }}
              className="text-white hover:text-purple-200 transition font-bold shrink-0"
            >
              🏠 Home
            </button>
            <button
              onClick={() => { setSelectedCategory(''); onNavigate('shop'); }}
              className="text-purple-200 hover:text-white transition font-bold shrink-0"
            >
              🔥 All Products
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCategory(c.slug); onNavigate('shop', c.slug); }}
                className="text-purple-200 hover:text-white transition shrink-0 whitespace-nowrap"
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="text-purple-300 font-semibold shrink-0 pl-4 hidden lg:block">
            ⚡ Free Shipping over $100 & 24/7 Support
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-950 border-t border-purple-800 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => { setSelectedCategory(''); onNavigate('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-white hover:text-purple-300"
          >
            🏠 Home
          </button>
          <button
            onClick={() => { setSelectedCategory(''); onNavigate('shop'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-purple-200 hover:text-white"
          >
            🔥 All Products
          </button>
          <div className="py-2 border-t border-purple-900">
            <p className="text-xs text-purple-400 font-semibold mb-2 uppercase tracking-wider">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.slug); onNavigate('shop', c.slug); setMobileMenuOpen(false); }}
                  className="text-left text-xs text-purple-200 hover:text-white py-1.5 truncate"
                >
                  • {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Choose your delivery location</h3>
            <p className="text-xs text-gray-600 mb-4">Delivery options and delivery speeds may vary for different locations</p>
            <input
              type="text"
              defaultValue={currentLocation}
              id="loc-input"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('loc-input') as HTMLInputElement;
                  if (input) setCurrentLocation(input.value);
                  setLocationModalOpen(false);
                }}
                className="px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

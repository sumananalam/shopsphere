import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrdersPage from './components/OrdersPage';
import WishlistPage from './components/WishlistPage';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { User, Category, Product } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>({
    id: 2,
    name: 'Sophia Taylor',
    email: 'customer@purplecart.com',
    role: 'customer',
    phone: '+1 (555) 789-0123',
    created_at: new Date().toISOString()
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [activeCouponCode, setActiveCouponCode] = useState<string>('');
  const [cartUpdatedKey, setCartUpdatedKey] = useState<number>(0);

  // Home sections data
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [dealsProducts, setDealsProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(catData);

      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      setTrendingProducts(prodData.filter((p: Product) => p.is_trending));
      setBestSellers(prodData.filter((p: Product) => p.is_best_seller));
      setDealsProducts(prodData.filter((p: Product) => p.is_deal));

      if (user) {
        fetchUserCounts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserCounts = async () => {
    if (!user) return;
    try {
      const cartRes = await fetch('/api/cart', { headers: { 'x-user-id': String(user.id) } });
      const cartData = await cartRes.json();
      const totalQty = cartData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      setCartCount(totalQty);

      const wishRes = await fetch('/api/wishlist', { headers: { 'x-user-id': String(user.id) } });
      const wishData = await wishRes.json();
      setWishlistCount(wishData.length || 0);
      setWishlistIds(wishData.map((w: any) => w.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (productId: number, qty = 1) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, quantity: qty })
      });
      fetchUserCounts();
      setCartUpdatedKey(prev => prev + 1);
      setCartDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const isWishlisted = wishlistIds.includes(productId);
      if (isWishlisted) {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { 'x-user-id': String(user.id) }
        });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId })
        });
      }
      fetchUserCounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = (id: number) => {
    setSelectedProductId(id);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string, categorySlug?: string) => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (_subtotal: number, _discount: number, coupon: string) => {
    setActiveCouponCode(coupon);
    setCheckoutModalOpen(true);
  };

  const handleBuyNow = (productId: number, qty: number) => {
    handleAddToCart(productId, qty);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#1F1B2D] flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        user={user}
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => { setUser(null); setCartCount(0); setWishlistCount(0); setCurrentView('home'); }}
        onOpenCart={() => setCartDrawerOpen(true)}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            <HeroBanner onShopNow={() => handleNavigate('shop')} />
            <CategoryGrid categories={categories} onSelectCategory={(slug) => { setSelectedCategory(slug); handleNavigate('shop', slug); }} />
            
            {/* Trending Products */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Trending Products ⚡</h2>
                  <p className="text-xs text-gray-600 mt-1">Most popular items requested by our community this week</p>
                </div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(id) => handleAddToCart(id, 1)}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={handleViewDetails}
                    isWishlisted={wishlistIds.includes(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Today's Deals Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 p-8 sm:p-12 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                    Limited Time Offer
                  </span>
                  <h2 className="text-3xl font-black tracking-tight mb-2">Today's Mega Purple Deals</h2>
                  <p className="text-purple-200 text-xs sm:text-sm max-w-lg">
                    Save up to 40% on top electronics, luxury fashion, and home appliances. Grab them before stock runs out!
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="px-8 py-4 bg-white text-purple-950 font-extrabold text-xs rounded-2xl hover:bg-purple-100 transition shadow-xl shrink-0"
                >
                  Shop All Deals 🔥
                </button>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Best Sellers 🌟</h2>
                  <p className="text-xs text-gray-600 mt-1">Top-rated products with exceptional customer satisfaction</p>
                </div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(id) => handleAddToCart(id, 1)}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={handleViewDetails}
                    isWishlisted={wishlistIds.includes(p.id)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {currentView === 'shop' && (
          <ProductList
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={(id) => handleAddToCart(id, 1)}
            onToggleWishlist={handleToggleWishlist}
            onViewDetails={handleViewDetails}
            wishlistIds={wishlistIds}
          />
        )}

        {currentView === 'details' && (
          <ProductDetails
            productId={selectedProductId}
            user={user}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onViewDetails={handleViewDetails}
            onBuyNow={handleBuyNow}
            isWishlisted={wishlistIds.includes(selectedProductId)}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage user={user} onViewDetails={handleViewDetails} />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            user={user}
            onAddToCart={(id) => handleAddToCart(id, 1)}
            onViewDetails={handleViewDetails}
            onWishlistChange={fetchUserCounts}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard categories={categories} />
        )}
      </main>

      {/* Cart Slide-over */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        userId={user?.id || 2}
        onProceedToCheckout={handleProceedToCheckout}
        cartUpdatedKey={cartUpdatedKey}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchUserCounts();
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        user={user}
        couponCode={activeCouponCode}
        onOrderSuccess={(_orderId, _orderNum) => {
          fetchUserCounts();
          setCurrentView('orders');
        }}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

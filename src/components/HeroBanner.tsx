import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Headphones, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
}

export default function HeroBanner({ onShopNow }: HeroBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-2xl p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between">
        
        {/* Background decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-800/80 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Spring Super Sale – Up to 40% OFF</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-none">
            Discover Tech, Fashion & Living with <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">ShopSphere</span>
          </h1>

          <p className="text-purple-200 text-sm sm:text-base mb-8 leading-relaxed">
            Experience lightning-fast delivery, secure payments, verified customer reviews, and premium handpicked products across 9 curated categories.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={onShopNow}
              className="px-8 py-4 bg-white text-purple-950 font-extrabold text-sm rounded-2xl hover:bg-purple-100 transition shadow-xl flex items-center gap-3 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={onShopNow}
              className="px-8 py-4 bg-purple-800/80 hover:bg-purple-800 text-white font-bold text-sm rounded-2xl transition border border-purple-400/30 shadow-lg"
            >
              View Today's Deals
            </button>
          </div>
        </div>

        {/* Hero Illustration / Featured Product Preview */}
        <div className="relative z-10 w-full md:w-auto flex justify-center">
          <div className="relative w-72 sm:w-80 lg:w-96 h-72 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/30 group">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
              alt="Featured Product"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-1">
                BEST SELLER ⚡
              </span>
              <p className="text-lg font-bold text-white">Pulse Pro Wireless Headphones</p>
              <p className="text-purple-200 text-xs font-semibold">$249.99 <span className="line-through text-purple-400 font-normal">$299.99</span></p>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Fast & Free Delivery</h3>
            <p className="text-xs text-gray-600">Free shipping on all orders over $100</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Secure Payments</h3>
            <p className="text-xs text-gray-600">100% secure checkout & sandbox protection</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">24/7 Expert Support</h3>
            <p className="text-xs text-gray-600">Dedicated assistance anytime you need</p>
          </div>
        </div>
      </div>
    </div>
  );
}

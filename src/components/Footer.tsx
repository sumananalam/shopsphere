import React from 'react';
import { Send, ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white pt-16 pb-12 border-t border-purple-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter section */}
        <div className="bg-purple-900/60 p-8 rounded-3xl border border-purple-500/30 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-bold">Subscribe to ShopSphere Insider</h3>
            <p className="text-xs text-purple-200 mt-1">Get exclusive weekly deals, VIP discounts, and new arrivals straight to your inbox.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="px-4 py-3 bg-purple-950 text-white placeholder-purple-400 text-xs rounded-xl border border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full md:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-purple-950 font-bold text-xs rounded-xl hover:bg-purple-100 transition shrink-0 shadow-md flex items-center gap-1.5"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs">
          <div>
            <h4 className="font-bold text-sm text-purple-200 uppercase tracking-wider mb-4">Get to Know Us</h4>
            <ul className="space-y-2.5 text-purple-300">
              <li><a href="#" className="hover:text-white transition">About ShopSphere</a></li>
              <li><a href="#" className="hover:text-white transition">Careers & Culture</a></li>
              <li><a href="#" className="hover:text-white transition">Press Releases</a></li>
              <li><a href="#" className="hover:text-white transition">Sustainability Initiatives</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-purple-200 uppercase tracking-wider mb-4">Make Money with Us</h4>
            <ul className="space-y-2.5 text-purple-300">
              <li><a href="#" className="hover:text-white transition">Sell on ShopSphere</a></li>
              <li><a href="#" className="hover:text-white transition">Protect & Build Your Brand</a></li>
              <li><a href="#" className="hover:text-white transition">Advertise Your Products</a></li>
              <li><a href="#" className="hover:text-white transition">Become an Affiliate</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-purple-200 uppercase tracking-wider mb-4">Let Us Help You</h4>
            <ul className="space-y-2.5 text-purple-300">
              <li><a href="#" className="hover:text-white transition">Your Account & Orders</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Rates & Policies</a></li>
              <li><a href="#" className="hover:text-white transition">Returns & Replacements</a></li>
              <li><a href="#" className="hover:text-white transition">24/7 Customer Assistance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-purple-200 uppercase tracking-wider mb-4">ShopSphere Security</h4>
            <ul className="space-y-2.5 text-purple-300">
              <li><span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Secure Checkout</span></li>
              <li><span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-purple-300" /> Fast Global Delivery</span></li>
              <li><span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-purple-300" /> 30-Day Money Back</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-purple-800/40 text-center text-xs text-purple-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm">SS</div>
            <span className="font-bold text-white text-sm">ShopSphere E-Commerce Platform</span>
          </div>
          <p>© 2026 ShopSphere Inc. All rights reserved. Built with precision & modern web architecture.</p>
        </div>

      </div>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';
import { Shield, Package, Users, DollarSign, Plus, Edit, Trash2, CheckCircle2, X } from 'lucide-react';
import { Product, Category, User, Order } from '../types';

interface AdminDashboardProps {
  categories: Category[];
}

export default function AdminDashboard({ categories }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');
  const [loading, setLoading] = useState(true);

  // Add/Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [stockQuantity, setStockQuantity] = useState('50');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes, userRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/users')
      ]);

      setStats(await statsRes.json());
      setProducts(await prodRes.json());
      setOrders(await ordRes.json());
      setUsersList(await userRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          original_price: Number(originalPrice || price),
          brand,
          category_id: Number(categoryId),
          stock_quantity: Number(stockQuantity),
          image_url: imageUrl
        })
      });

      if (!res.ok) throw new Error('Failed to save product');

      setProductModalOpen(false);
      setEditingProduct(null);
      resetProductForm();
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setBrand('');
    setStockQuantity('50');
    setImageUrl('');
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setOriginalPrice(String(p.original_price));
    setBrand(p.brand);
    setCategoryId(p.category_id);
    setStockQuantity(String(p.stock_quantity || 50));
    setImageUrl(p.primary_image || '');
    setProductModalOpen(true);
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-purple-900 to-indigo-900 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700/60 border border-purple-400/30 text-xs font-semibold mb-2">
            <Shield className="w-4 h-4 text-purple-200" /> Authorized Admin Access
          </div>
          <h1 className="text-3xl font-black tracking-tight">ShopSphere Admin Dashboard</h1>
          <p className="text-xs text-purple-200 mt-1">Manage platform inventory, monitor sales revenue, orders, and customer accounts</p>
        </div>

        <button
          onClick={() => { setEditingProduct(null); resetProductForm(); setProductModalOpen(true); }}
          className="px-6 py-3 bg-white text-purple-950 font-bold text-xs rounded-xl hover:bg-purple-100 transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-8">
        {[
          { key: 'overview', label: '📊 Overview & Stats' },
          { key: 'products', label: `📦 Products (${products.length})` },
          { key: 'orders', label: `🛍️ Orders (${orders.length})` },
          { key: 'users', label: `👥 Users (${usersList.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-4 font-bold text-sm border-b-2 transition ${
              activeTab === tab.key ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-black text-gray-950 mt-1">${stats.revenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Orders</p>
                <h3 className="text-2xl font-black text-gray-950 mt-1">{stats.ordersCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Products</p>
                <h3 className="text-2xl font-black text-gray-950 mt-1">{stats.productsCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl font-black text-gray-950 mt-1">{stats.usersCount}</h3>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100">
            <h3 className="text-lg font-black text-gray-900 mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders?.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-purple-50/50">
                      <td className="py-4 font-bold text-purple-900">{ord.order_number}</td>
                      <td className="py-4 font-semibold text-gray-900">{ord.user_name || 'Guest'}</td>
                      <td className="py-4 font-bold text-gray-900">${ord.final_amount.toFixed(2)}</td>
                      <td className="py-4 font-semibold text-purple-700">{ord.status}</td>
                      <td className="py-4 text-gray-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">Product Management</h3>
            <button
              onClick={() => { setEditingProduct(null); resetProductForm(); setProductModalOpen(true); }}
              className="px-4 py-2 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/50">
                    <td className="py-4 flex items-center gap-3">
                      <img src={p.primary_image} alt="" className="w-12 h-12 rounded-xl object-cover border border-purple-200" />
                      <div>
                        <p className="font-bold text-gray-900 truncate max-w-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-500">Brand: {p.brand}</p>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-gray-700">{p.category_name}</td>
                    <td className="py-4 font-black text-gray-950">${p.price.toFixed(2)}</td>
                    <td className="py-4 font-semibold text-emerald-700">{p.stock_quantity ?? 50} units</td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 font-bold transition"
                      >
                        <Edit className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 font-bold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100">
          <h3 className="text-lg font-black text-gray-900 mb-6">Customer Orders Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-purple-50/50">
                    <td className="py-4 font-bold text-purple-900">{ord.order_number}</td>
                    <td className="py-4 font-semibold text-gray-900">{ord.user_name || 'Guest'}</td>
                    <td className="py-4 font-black text-gray-950">${ord.final_amount.toFixed(2)}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-xs focus:ring-1 focus:ring-purple-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100">
          <h3 className="text-lg font-black text-gray-900 mb-6">Customer Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-50/50">
                    <td className="py-4 font-bold text-gray-900">{u.name}</td>
                    <td className="py-4 text-gray-700">{u.email}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{u.phone || 'N/A'}</td>
                    <td className="py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-8 border border-purple-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setProductModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ultra HD Smart TV"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. PurpleTech"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="199.99"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="249.99"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL (Unsplash)</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specifications and features..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-200"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

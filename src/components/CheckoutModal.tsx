import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, CreditCard, CheckCircle2, Truck } from 'lucide-react';
import { Address, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  couponCode: string;
  onOrderSuccess: (orderId: number, orderNumber: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  user,
  couponCode,
  onOrderSuccess
}: CheckoutModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ orderId: number; orderNumber: string } | null>(null);

  // New Address form state
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (isOpen && user) {
      fetchAddresses();
    }
  }, [isOpen, user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses', {
        headers: { 'x-user-id': String(user?.id || 2) }
      });
      const data = await res.json();
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      } else {
        setShowNewAddress(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 2,
          full_name: fullName,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          postal_code: postalCode,
          country,
          phone
        })
      });
      const data = await res.json();
      setSelectedAddressId(data.id);
      setShowNewAddress(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(user?.id || 2)
        },
        body: JSON.stringify({
          userId: user?.id || 2,
          addressId: selectedAddressId,
          paymentMethod,
          couponCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setSuccessData({ orderId: data.orderId, orderNumber: data.orderNumber });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-purple-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-purple-200 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/50 flex items-center justify-center border border-purple-400/30">
              <ShieldCheck className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Secure Checkout</h2>
              <p className="text-xs text-purple-200">Complete your ShopSphere order safely</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {successData ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Thank you for shopping with ShopSphere. Your order has been securely processed and is now being prepared for shipment.
              </p>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 inline-block text-left">
                <p className="text-xs font-bold text-gray-700">Order Number: <span className="text-purple-700">{successData.orderNumber}</span></p>
                <p className="text-xs font-bold text-gray-700">Payment Status: <span className="text-emerald-700">Paid (Sandbox Gateway)</span></p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    onOrderSuccess(successData.orderId, successData.orderNumber);
                    onClose();
                  }}
                  className="px-8 py-3.5 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 transition shadow-lg shadow-purple-200"
                >
                  View Order & Tracking Status
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Shipping Address Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-700" /> Shipping Address
                  </h3>
                  <button
                    onClick={() => setShowNewAddress(!showNewAddress)}
                    className="text-xs font-bold text-purple-700 hover:underline"
                  >
                    {showNewAddress ? 'Select Existing' : '+ Add New Address'}
                  </button>
                </div>

                {showNewAddress ? (
                  <form onSubmit={handleAddAddress} className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Address Line 1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-700 text-white font-bold text-xs rounded-xl hover:bg-purple-800 transition"
                    >
                      Save Address
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? 'bg-purple-50/80 border-purple-700 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-purple-700 focus:ring-purple-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900">{addr.full_name}</p>
                          <p className="text-gray-600">{addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}</p>
                          <p className="text-gray-500 mt-1">Phone: {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-700" /> Payment Method (Sandbox Simulation)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Credit Card', 'PayPal Sandbox', 'Cash on Delivery'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition text-center ${
                        paymentMethod === m
                          ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                          : 'bg-white text-gray-800 border-gray-200 hover:bg-purple-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Truck className="w-5 h-5" />
                {loading ? 'Processing Secure Payment...' : 'Place Order Now'}
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

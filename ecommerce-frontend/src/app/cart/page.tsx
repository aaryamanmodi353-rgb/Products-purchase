"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Smartphone, Building2, Truck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { API_URL } from "@/lib/constants";

const PAYMENT_METHODS = [
  { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { id: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "NET_BANKING", label: "Net Banking", icon: Building2 },
  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Truck },
];

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [showCheckout, setShowCheckout] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [address, setAddress] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleProceed = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    setFetchingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddress(data.address || "");
      }
    } catch (e) {
      // Ignore fetch errors, user can just type address manually
    } finally {
      setFetchingProfile(false);
      setShowCheckout(true);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!address.trim()) {
      setError("Please enter a shipping address to deliver your order.");
      return;
    }

    // Validate card fields for card payments
    if (paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        setError("Please enter a valid card number");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError("Please enter a valid expiry date (MM/YY)");
        return;
      }
      if (cardCvv.length < 3) {
        setError("Please enter a valid CVV");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      // First, silently save their address to their profile
      const putRes = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ address: address.trim() }),
      });
      
      if (!putRes.ok) {
        throw new Error("Failed to save shipping address");
      }

      // Then process the order
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
        }),
      });

      if (!res.ok) {
        let msg = "Checkout failed";
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          msg = data.message || data.error || msg;
        } catch {
          msg = text || msg;
        }
        throw new Error(msg);
      }

      clearCart();
      router.push("/orders?success=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Add some products to get started!</p>
        <Link href="/" className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate">{item.name}</h3>
                  </Link>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition text-sm">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white min-w-[32px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition text-sm">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary / Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!showCheckout ? (
                <button onClick={handleProceed} disabled={fetchingProfile}
                  className="mt-6 w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg disabled:opacity-70">
                  {fetchingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Proceed to Checkout
                </button>
              ) : (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Address Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</h4>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className="w-full rounded-xl border-0 py-2.5 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 resize-none transition"
                    />
                  </div>

                  <hr className="border-gray-100 dark:border-gray-800" />

                  {/* Payment Method Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Payment Method</h4>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <button key={pm.id} onClick={() => { setPaymentMethod(pm.id); setError(""); }}
                          className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition text-sm font-medium ${
                            paymentMethod === pm.id
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                          }`}>
                          <pm.icon className="h-4 w-4" /> {pm.label}
                        </button>
                      ))}
                    </div>

                    {/* Credit Card Details */}
                    {(paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") && (
                      <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                        <input type="text" placeholder="Card Number" maxLength={19} value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          className="w-full rounded-xl border-0 py-2.5 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="rounded-xl border-0 py-2.5 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600" />
                          <input type="text" placeholder="CVV" maxLength={4} value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="rounded-xl border-0 py-2.5 px-3 text-sm text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600" />
                        </div>
                      </div>
                    )}

                    {/* UPI QR Code Flow */}
                    {paymentMethod === "UPI" && (
                      <div className="space-y-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 animate-in fade-in zoom-in-95 duration-200">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=technova@upi&pn=TechNova`} alt="UPI QR Code" className="w-32 h-32 rounded-lg" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Scan this QR code with any UPI app to pay</p>
                        <button onClick={handleCheckout} disabled={loading} className="mt-2 flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition disabled:opacity-50">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {loading ? "Processing Payment..." : "Simulate Scan & Pay"}
                        </button>
                      </div>
                    )}
                  </div>

                  {error && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                  {paymentMethod !== "UPI" && (
                    <button onClick={handleCheckout} disabled={loading}
                      className="w-full flex justify-center items-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

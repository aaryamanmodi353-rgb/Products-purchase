"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCart, CreditCard, Smartphone, Building2, Truck, ArrowLeft } from "lucide-react";
import { API_URL } from "@/lib/constants";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

const PAYMENT_METHODS = [
  { id: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
  { id: "DEBIT_CARD", label: "Debit Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "NET_BANKING", label: "Net Banking", icon: Building2 },
  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Truck },
];

export default function ProductPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Credit card form fields (visual only — simulated)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/products/${params.id}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(() => setError("Product not found"));
  }, [params.id]);

  const handlePurchase = async () => {
    if (!user) {
      router.push("/login");
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
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          items: [{ productId: product!.id, quantity }],
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Purchase failed");
      }

      router.push("/orders?success=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-gray-900">
            <img src={product.imageUrl} alt={product.name} className="w-full h-[500px] object-cover" />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{product.description}</p>
              <p className="mt-6 text-4xl font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
              </p>

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</label>
                <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">−</button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition">+</button>
                </div>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                disabled={product.stockQuantity === 0}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-lg font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                <ShoppingCart className="h-5 w-5" /> Buy Now — ${(product.price * quantity).toFixed(2)}
              </button>
            ) : (
              <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Payment Method</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition text-sm font-medium ${
                        paymentMethod === pm.id
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <pm.icon className="h-5 w-5" />
                      {pm.label}
                    </button>
                  ))}
                </div>

                {/* Card Details (shown for Credit/Debit Card) */}
                {(paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") && (
                  <div className="space-y-3">
                    <input type="text" placeholder="Card Number" maxLength={19} value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                      className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                      <input type="text" placeholder="CVV" maxLength={4} value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="rounded-xl bg-green-600 px-8 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition shadow-lg"
                  >
                    {loading ? "Processing..." : "Confirm & Pay"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, XCircle, CheckCircle, Clock, X } from "lucide-react";
import { API_URL } from "@/lib/constants";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  cancelReason: string | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  CONFIRMED: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", icon: CheckCircle },
  PENDING: { bg: "bg-yellow-50 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", icon: Clock },
  CANCELLED: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", icon: XCircle },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Cancel modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Order placed successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !cancellingOrderId) return;
    if (!cancelReason.trim()) {
      setCancelError("Please provide a reason for cancellation.");
      return;
    }

    setCancelError("");
    try {
      const res = await fetch(`${API_URL}/api/orders/${cancellingOrderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      setCancellingOrderId(null);
      setCancelReason("");
      fetchOrders();
    } catch {
      setCancelError("Failed to cancel order. Please try again.");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Track and manage your purchases</p>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 py-3 px-4 rounded-xl text-sm">
            <CheckCircle className="h-5 w-5" /> {successMessage}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start shopping to see your orders here!</p>
            <button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const style = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
              const StatusIcon = style.icon;
              return (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Order #{order.id}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="font-medium text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <img src={item.productImageUrl} alt={item.productName} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${item.priceAtPurchase.toFixed(2)}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${(item.quantity * item.priceAtPurchase).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Cancel reason display */}
                  {order.cancelReason && (
                    <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
                      <p className="text-xs text-red-600 dark:text-red-400"><span className="font-semibold">Cancellation reason:</span> {order.cancelReason}</p>
                    </div>
                  )}

                  {/* Order Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Paid via {order.paymentMethod.replace(/_/g, " ")}
                    </span>
                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => { setCancellingOrderId(order.id); setCancelReason(""); setCancelError(""); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <XCircle className="h-4 w-4" /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Reason Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Order #{cancellingOrderId}</h3>
              <button onClick={() => setCancellingOrderId(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please provide a reason for cancelling this order. This helps us improve our service.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Found a better deal, ordered by mistake, no longer needed..."
              className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm h-28 resize-none"
            />
            {cancelError && <p className="mt-2 text-red-500 text-xs">{cancelError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setCancellingOrderId(null)}
                className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Keep Order
              </button>
              <button onClick={handleCancel}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

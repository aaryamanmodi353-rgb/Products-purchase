"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/constants";

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          stockQuantity: parseInt(stockQuantity),
        }),
      });

      if (!res.ok) throw new Error("Failed to list product");

      setMessage("Your product has been listed!");
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setStockQuantity("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40">
              <PackagePlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sell a Product</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">List your item on TechNova for others to buy</p>
            </div>
          </div>

          {message && <div className="mb-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/30 py-3 px-4 rounded-xl">{message}</div>}
          {error && <div className="mb-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/30 py-3 px-4 rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Vintage Mechanical Keyboard"
                className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product, its condition, and key features..."
                className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm h-28 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                <input type="number" step="0.01" min="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="49.99"
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input type="number" min="1" required value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
              <input type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg">
              {loading ? "Listing..." : "List Product for Sale"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

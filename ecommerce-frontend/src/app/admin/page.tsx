"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Package } from "lucide-react";
import { API_URL } from "@/lib/constants";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch { /* ignore */ }
  };

  if (!user || user.role !== "ADMIN") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

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

      if (!res.ok) throw new Error("Failed to create product");

      setMessage("Product added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setStockQuantity("");
      setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMessage("Product deleted.");
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>

        {message && <div className="mb-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/30 py-3 px-4 rounded-xl">{message}</div>}
        {error && <div className="mb-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/30 py-3 px-4 rounded-xl">{error}</div>}

        {/* Add Product Form */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Product</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm h-20 resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <input type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                <input type="number" required value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Package className="h-5 w-5" /> All Products ({products.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-center gap-4">
                  <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)} · {product.stockQuantity} in stock</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition" title="Delete">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            {products.length === 0 && (
              <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No products yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Package, RefreshCw, Database } from "lucide-react";
import { API_URL } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  sku?: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageDimensionMessage, setImageDimensionMessage] = useState("");
  const imageCheckId = useRef(0);
  const [stockQuantity, setStockQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [seedingCatalog, setSeedingCatalog] = useState(false);

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
    if (!imageDimensions) {
      setError("Enter an image URL, then move focus away so TechNova can read its dimensions.");
      return;
    }
    setSavingProduct(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/catalog/commercetools/products`, {
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
          imageWidth: imageDimensions.width,
          imageHeight: imageDimensions.height,
          stockQuantity: parseInt(stockQuantity),
        }),
      });

      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || result?.detail || "Failed to create product in commercetools.");
      }

      setMessage(`Product published in commercetools and added to TechNova${result?.sku ? ` (SKU ${result.sku})` : ""}.`);
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setImageDimensions(null);
      setImageDimensionMessage("");
      setStockQuantity("");
      setShowForm(false);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (id: string) => {
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

  const handleSyncCatalog = async () => {
    setMessage("");
    setError("");
    setSyncingCatalog(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/catalog/commercetools/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || result?.detail || "Failed to sync the commercetools catalog.");
      }

      setMessage(`Catalog sync complete: ${result.created} new, ${result.updated} updated, ${result.skippedIncomplete} skipped (missing a USD price, name, or image).`);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handleSeedExistingCatalog = async () => {
    setMessage("");
    setError("");
    setSeedingCatalog(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/catalog/commercetools/seed-existing`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || result?.detail || "Failed to seed the existing TechNova catalog.");
      }

      setMessage(
        `Catalog seed complete: ${result.created} added to commercetools, ${result.alreadyPresent} already present, ` +
        `${result.skippedIncomplete} skipped, ${result.failed} failed. Storefront sync: ` +
        `${result.syncedCreated} new and ${result.syncedUpdated} updated.`
      );
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        setError(result.errors.join(" "));
      }
      await fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeedingCatalog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage products published through commercetools</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedExistingCatalog}
              disabled={seedingCatalog || syncingCatalog}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-wait disabled:opacity-60 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900"
              title="Copy the products already in TechNova into commercetools. Safe to repeat."
            >
              <Database className="h-4 w-4" />
              {seedingCatalog ? "Seeding catalog…" : "Seed existing products"}
            </button>
            <button
              onClick={handleSyncCatalog}
              disabled={syncingCatalog || seedingCatalog}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${syncingCatalog ? "animate-spin" : ""}`} />
              {syncingCatalog ? "Syncing…" : "Sync commercetools"}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
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
                <input type="url" required value={imageUrl}
                  onChange={(e) => {
                    imageCheckId.current += 1;
                    setImageUrl(e.target.value);
                    setImageDimensions(null);
                    setImageDimensionMessage("");
                  }}
                  onBlur={() => {
                    if (!imageUrl.trim()) return;
                    const checkId = ++imageCheckId.current;
                    setImageDimensionMessage("Checking image dimensions…");
                    const imageProbe = new window.Image();
                    imageProbe.onload = () => {
                      if (checkId !== imageCheckId.current) return;
                      if (imageProbe.naturalWidth > 0 && imageProbe.naturalHeight > 0) {
                        setImageDimensions({ width: imageProbe.naturalWidth, height: imageProbe.naturalHeight });
                        setImageDimensionMessage(`Image dimensions: ${imageProbe.naturalWidth} × ${imageProbe.naturalHeight}`);
                      } else {
                        setImageDimensions(null);
                        setImageDimensionMessage("Could not read image dimensions. Check the URL and try again.");
                      }
                    };
                    imageProbe.onerror = () => {
                      if (checkId !== imageCheckId.current) return;
                      setImageDimensions(null);
                      setImageDimensionMessage("Could not load this image. Check the URL and try again.");
                    };
                    imageProbe.src = imageUrl.trim();
                  }}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                {imageDimensionMessage && <p role="status" className="mt-2 text-xs text-gray-500 dark:text-gray-400">{imageDimensionMessage}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                <input type="number" required value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={savingProduct} className="w-full rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60 transition">
                  {savingProduct ? "Publishing…" : "Publish Product"}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)} · {product.stockQuantity} in stock{product.sku ? ` · SKU ${product.sku}` : ""}</p>
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

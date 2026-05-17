'use client';

import Link from 'next/link';
import { Trash2, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { API_URL } from "@/lib/constants";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

export default function ProductCard({ product, onDelete }: { product: Product; onDelete?: (id: number) => void }) {
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = items.some((i) => i.productId === product.id);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      maxStock: product.stockQuantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleDelete = async () => {
    if (!user || user.role !== 'ADMIN') return;
    if (!confirm(`Delete "${product.name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      if (onDelete) onDelete(product.id);
    } catch {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
      {/* Admin delete badge */}
      {user?.role === 'ADMIN' && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
          title="Remove product"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Link href={`/products/${product.id}`} className="relative w-full h-64 overflow-hidden block">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-600 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col space-y-2 p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
        <div className="flex flex-1 flex-col justify-end">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</p>
            <span className="text-xs text-gray-400 dark:text-gray-500">{product.stockQuantity} left</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
              justAdded
                ? 'bg-green-600 text-white'
                : isInCart
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <><Check className="h-4 w-4" /> Added!</>
            ) : isInCart ? (
              <><ShoppingCart className="h-4 w-4" /> Add More</>
            ) : product.stockQuantity === 0 ? (
              'Out of Stock'
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
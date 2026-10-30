'use client';

import Link from 'next/link';
import { Trash2, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { API_URL } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
}

export default function ProductCard({ product, onDelete }: { product: Product; onDelete?: (id: string) => void }) {
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-gray-800">
      {/* Admin delete badge */}
      {user?.role === 'ADMIN' && (
        <button
          onClick={handleDelete}
          className="absolute right-3 top-3 z-10 rounded-full bg-red-700/90 p-2.5 text-white opacity-0 shadow-lg transition hover:bg-red-800 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 group-hover:opacity-100"
          title="Remove product"
          aria-label={`Remove ${product.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Link href={`/products/${product.id}`} className="relative block aspect-[1.08] w-full overflow-hidden bg-[#e7e8df] dark:bg-[#29372d]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-5 transition-transform duration-700 group-hover:scale-105 sm:p-6"
        />
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="rounded-full bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col space-y-2 p-5 sm:p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-editorial text-lg font-semibold leading-snug text-gray-900 transition hover:text-indigo-700 dark:text-white dark:hover:text-indigo-300">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">{product.description}</p>
        <div className="flex flex-1 flex-col justify-end">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">{product.stockQuantity} left</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
              justAdded
                ? 'bg-green-600 text-white'
                : isInCart
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            {justAdded ? (
              <><Check aria-hidden="true" className="h-4 w-4" /> Added!</>
            ) : isInCart ? (
              <><ShoppingCart aria-hidden="true" className="h-4 w-4" /> Add More</>
            ) : product.stockQuantity === 0 ? (
              'Out of Stock'
            ) : (
              <><ShoppingCart aria-hidden="true" className="h-4 w-4" /> Add to Cart</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

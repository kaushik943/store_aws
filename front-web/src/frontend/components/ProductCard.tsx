import React from 'react';
import { Plus, Minus, Eye } from 'lucide-react';
import { Product, CartItem } from '../../types';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  addToCart: (p: Product) => void;
  removeFromCart: (id: number) => void;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onClick?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product, cartItem, addToCart, removeFromCart, onClick
}) => {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isOutOfStock = product.out_of_stock || (product.stock !== undefined && product.stock <= 0);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 group flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden w-full relative ${isOutOfStock ? 'opacity-75' : ''}`}
      onClick={() => onClick?.(product)}
    >
      {/* Image Container - Perfect Square & Auto-Adjusting */}
      <div className="relative w-full aspect-square bg-white dark:bg-slate-800 flex items-center justify-center border-b border-slate-50 dark:border-slate-800/80 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && !isOutOfStock && (
            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">
              {discount}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* ... (Eye button and cart overlay) ... */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(product); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-slate-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-slate-100 dark:border-slate-700 hover:text-emerald-600 shadow-sm z-10"
          title="View Details"
        >
          <Eye size={13} />
        </button>

        {cartItem && cartItem.quantity > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-emerald-600/95 backdrop-blur-sm text-white text-[9px] font-black text-center py-1 uppercase tracking-widest z-10">
            {cartItem.quantity} in cart
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 bg-white dark:bg-slate-900">
        <div className="min-h-[2.25rem] md:min-h-[2.5rem] mb-1">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] md:text-[12px] line-clamp-2 leading-tight">
            {product.name}
          </h4>
        </div>

        <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mb-2 truncate">
          {product.unit}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-end justify-between gap-2 sm:block sm:leading-none">
            <span className="text-[13px] md:text-sm font-black text-slate-900 dark:text-white">₹{product.price}</span>
            {product.mrp && product.mrp > product.price ? (
              <span className="text-[9px] text-slate-400 line-through font-medium">₹{product.mrp}</span>
            ) : (
              <span className="text-[9px] opacity-0">₹0</span>
            )}
          </div>

          {isOutOfStock ? (
            <div className="w-full sm:w-auto px-3 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg font-black text-[9px] uppercase tracking-tighter shrink-0 cursor-not-allowed">
              Out of Stock
            </div>
          ) : cartItem && cartItem.quantity > 0 ? (
            <div
              className="w-full sm:w-auto flex items-center justify-between bg-emerald-600 text-white rounded-lg overflow-hidden shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                className="w-7 h-8 flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-xs font-black">{cartItem.quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className="w-7 h-8 flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 h-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg font-black text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shrink-0"
            >
              ADD <Plus size={11} strokeWidth={3} className="ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

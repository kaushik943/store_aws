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
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product, cartItem, addToCart, removeFromCart, onClick, compact = false
}) => {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isOutOfStock = product.out_of_stock || (product.stock !== undefined && product.stock <= 0);

  const cardRadius = compact ? 'rounded-[0.9rem]' : 'rounded-[1.15rem]';
  const imagePadding = compact ? 'p-0.5' : 'p-1.5 sm:p-2';
  const contentPadding = compact ? 'p-1.5 gap-0.5' : 'p-2.5 sm:p-3 gap-1';
  const nameClass = compact
    ? 'min-h-[2.5rem] text-[10px] sm:text-[11px]'
    : 'min-h-[3rem] text-[11px] md:text-[12px]';
  const priceClass = compact ? 'text-[11px] sm:text-[12px]' : 'text-[13px] md:text-sm';
  const controlHeight = compact ? 'h-6.5' : 'h-8';
  const controlMinWidth = compact ? 'min-w-[62px]' : 'min-w-[76px]';
  const qtyMinWidth = compact ? 'min-w-[68px]' : 'min-w-[84px]';
  const buttonText = compact ? 'text-[8px]' : 'text-[10px]';
  const badgeText = compact ? 'text-[7px]' : 'text-[9px]';

  return (
    <div
      className={`bg-white dark:bg-slate-900 ${cardRadius} border border-slate-100 dark:border-slate-800 group flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden w-full relative ${isOutOfStock ? 'opacity-75' : ''}`}
      onClick={() => onClick?.(product)}
    >
      <div className="relative w-full aspect-square bg-white dark:bg-slate-800 flex items-center justify-center border-b border-slate-50 dark:border-slate-800/80 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-contain ${imagePadding} mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          referrerPolicy="no-referrer"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && !isOutOfStock && (
            <span className={`bg-emerald-600 text-white ${badgeText} font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase`}>
              {discount}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className={`bg-slate-500 text-white ${badgeText} font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase`}>
              Sold Out
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClick?.(product); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-slate-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-slate-100 dark:border-slate-700 hover:text-emerald-600 shadow-sm z-10"
          title="View Details"
        >
          <Eye size={13} />
        </button>

        {cartItem && cartItem.quantity > 0 && (
          <div className={`absolute bottom-0 inset-x-0 bg-emerald-600/95 backdrop-blur-sm text-white ${badgeText} font-black text-center py-1 uppercase tracking-widest z-10`}>
            {cartItem.quantity} in cart
          </div>
        )}
      </div>

      <div className={`${contentPadding} flex h-full flex-col bg-white dark:bg-slate-900`}>
        <h4 className={`${nameClass} overflow-hidden font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-[1.25]`}>
          {product.name}
        </h4>

        <div className="mt-1 flex min-h-[2.1rem] items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className={`${priceClass} font-black text-slate-900 dark:text-white`}>{"\u20B9"}{product.price}</span>
            {product.mrp && product.mrp > product.price ? (
              <span className="mt-0.5 block text-[9px] text-slate-400 line-through font-medium">{"\u20B9"}{product.mrp}</span>
            ) : (
              <span className="mt-0.5 block text-[9px] opacity-0">{"\u20B9"}0</span>
            )}
          </div>
          <p className="max-w-[42%] rounded-full bg-slate-50 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400 truncate leading-none text-right shrink-0">
            {product.unit}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-end gap-1 pt-1">
          {isOutOfStock ? (
            <div className={`${controlMinWidth} px-2 ${controlHeight} flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-black text-[8px] uppercase tracking-tight shrink-0 cursor-not-allowed`}>
              Out
            </div>
          ) : cartItem && cartItem.quantity > 0 ? (
            <div
              className={`${qtyMinWidth} ${controlHeight} flex items-center justify-between bg-emerald-600 text-white rounded-xl overflow-hidden shrink-0`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                className={`w-7 ${controlHeight} flex items-center justify-center hover:bg-emerald-700 transition-colors`}
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="min-w-[20px] text-center text-[11px] font-black">{cartItem.quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className={`w-7 ${controlHeight} flex items-center justify-center hover:bg-emerald-700 transition-colors`}
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className={`${controlMinWidth} ${controlHeight} flex items-center justify-center gap-1 px-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl font-black ${buttonText} uppercase hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shrink-0`}
            >
              ADD <Plus size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

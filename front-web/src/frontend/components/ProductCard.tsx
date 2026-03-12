import React from 'react';
import { Plus, Minus } from 'lucide-react';
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
  const showUnit = Boolean(product.unit && product.unit.trim() && product.unit.trim().toLowerCase() !== 'na');

  const cardRadius = compact ? 'rounded-[1rem]' : 'rounded-[1.05rem] sm:rounded-[1.15rem]';
  const imagePadding = compact ? 'p-1.5' : 'p-2 sm:p-2.5';
  const contentPadding = compact ? 'px-2.5 pb-2.5 pt-2' : 'p-2.5 sm:p-3';
  const nameClass = compact
    ? 'min-h-[2.55rem] text-[11px]'
    : 'min-h-[3rem] text-[12px] md:text-[12px]';
  const priceClass = compact ? 'text-[14px]' : 'text-[15px] md:text-sm';
  const controlHeight = compact ? 'h-8' : 'h-9';
  const controlMinWidth = compact ? 'min-w-[74px]' : 'min-w-[84px]';
  const qtyMinWidth = compact ? 'min-w-[78px]' : 'min-w-[90px]';
  const buttonText = compact ? 'text-[10px]' : 'text-[10px]';
  const badgeText = compact ? 'text-[8px]' : 'text-[9px]';

  return (
    <div
      className={`bg-white dark:bg-slate-900 ${cardRadius} border border-slate-200/80 dark:border-slate-800 group flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden w-full relative ${isOutOfStock ? 'opacity-75' : ''}`}
      onClick={() => onClick?.(product)}
    >
      <div className="relative w-full aspect-[1.02] bg-slate-50/80 dark:bg-slate-800/70 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
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
            <span className={`bg-slate-600/95 text-white ${badgeText} font-black px-2 py-0.5 rounded-md shadow-sm uppercase`}>
              Sold Out
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          {isOutOfStock ? (
            <div className={`${controlMinWidth} px-2 ${controlHeight} flex items-center justify-center bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-[1rem] font-black text-[9px] uppercase tracking-tight shrink-0 cursor-not-allowed shadow-sm`}>
              Out
            </div>
          ) : cartItem && cartItem.quantity > 0 ? (
            <div
              className={`${qtyMinWidth} ${controlHeight} flex items-center justify-between bg-emerald-600 text-white rounded-[1rem] overflow-hidden shrink-0 shadow-lg shadow-emerald-500/20`}
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
              className={`${controlMinWidth} ${controlHeight} flex items-center justify-center gap-1 px-2 bg-white dark:bg-emerald-900/20 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-[1rem] font-black ${buttonText} uppercase hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shrink-0 shadow-lg shadow-white/60`}
            >
              ADD <Plus size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      <div className={`${contentPadding} flex h-full flex-col bg-white dark:bg-slate-900`}>
        <div className="flex items-baseline gap-1.5">
          <span className={`${priceClass} font-black text-slate-900 dark:text-white`}>{"\u20B9"}{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] text-slate-400 line-through font-medium">{"\u20B9"}{product.mrp}</span>
          )}
        </div>

        <h4 className={`${nameClass} overflow-hidden font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-[1.25]`}>
          {product.name}
        </h4>

        {showUnit && (
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
            {product.unit}
          </p>
        )}
      </div>
    </div>
  );
};

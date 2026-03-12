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
  const cardRadius = compact ? 'rounded-[1.1rem]' : 'rounded-[1.2rem]';
  const imagePadding = compact ? 'p-4' : 'p-5';
  const contentPadding = compact ? 'px-3 pb-3 pt-2.5' : 'px-3.5 pb-3.5 pt-3';
  const nameClass = compact ? 'min-h-[3.45rem] text-[11px]' : 'min-h-[3.7rem] text-[12px]';
  const pricePillClass = compact ? 'text-[11px] px-3 py-1.5' : 'text-[12px] px-3.5 py-1.5';
  const controlHeight = compact ? 'h-10' : 'h-11';
  const controlMinWidth = compact ? 'min-w-[84px]' : 'min-w-[92px]';
  const qtyMinWidth = compact ? 'min-w-[92px]' : 'min-w-[100px]';
  const badgeText = compact ? 'text-[8px]' : 'text-[9px]';
  const savings = product.mrp && product.mrp > product.price ? Math.round(product.mrp - product.price) : 0;
  const imageSrc = product.image || 'https://placehold.co/300x300/f3f4f6/9ca3af?text=Product';

  return (
    <div
      className={`bg-white ${cardRadius} border border-slate-200 group flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden w-full relative ${isOutOfStock ? 'opacity-85' : ''}`}
      onClick={() => onClick?.(product)}
    >
      <div className="relative w-full aspect-square bg-[#f7f7f7] flex items-center justify-center overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-contain ${imagePadding} group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
          referrerPolicy="no-referrer"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOutOfStock && (
            <span className={`bg-slate-500 text-white ${badgeText} font-black px-2 py-1 rounded-lg shadow-sm uppercase`}>
              Sold Out
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          {isOutOfStock ? (
            <div className={`${controlMinWidth} px-2 ${controlHeight} flex items-center justify-center bg-slate-100 border border-slate-300 text-slate-500 rounded-[1rem] font-black text-[10px] uppercase tracking-tight shrink-0 cursor-not-allowed shadow-sm`}>
              Out
            </div>
          ) : cartItem && cartItem.quantity > 0 ? (
            <div
              className={`${qtyMinWidth} ${controlHeight} flex items-center justify-between bg-[#ff2b78] text-white rounded-[1rem] overflow-hidden shrink-0 shadow-md`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                className={`w-8 ${controlHeight} flex items-center justify-center hover:bg-[#e11d63] transition-colors`}
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="min-w-[20px] text-center text-[11px] font-black">{cartItem.quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className={`w-8 ${controlHeight} flex items-center justify-center hover:bg-[#e11d63] transition-colors`}
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className={`${controlMinWidth} ${controlHeight} flex items-center justify-center gap-1 px-2 bg-white border-2 border-[#ff2b78] text-[#ff2b78] rounded-[1rem] font-black text-[11px] uppercase hover:bg-[#ff2b78] hover:text-white transition-all active:scale-95 shrink-0 shadow-md`}
            >
              ADD <Plus size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      <div className={`${contentPadding} flex h-full flex-col bg-white`}>
        <div className="flex items-center gap-2">
          <span className={`rounded-[0.75rem] bg-[#2f9e44] text-white font-black leading-none ${pricePillClass}`}>
            {"\u20B9"}{product.price}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[11px] text-slate-500 line-through font-semibold">{"\u20B9"}{product.mrp}</span>
          )}
        </div>

        {discount > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-tight text-[#2f9e44]">
              {"\u20B9"}{savings} OFF
            </span>
            <div className="h-px flex-1 border-t border-dashed border-slate-300" />
          </div>
        )}

        <h4 className={`${nameClass} mt-2 overflow-hidden font-semibold text-slate-900 line-clamp-3 leading-[1.28]`}>
          {product.name}
        </h4>

        {showUnit && (
          <p className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1">
            {product.unit}
          </p>
        )}
      </div>
    </div>
  );
};

import React from 'react';

function ProductCard({ product, onClick, isSelected }) {
  const parseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const sliderImages = parseJson(product.slider_images);
  const firstImage = sliderImages?.[0] || null;

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all hover:border-red-500/50 ${
        isSelected ? 'border-red-500' : ''
      }`}
    >
      <div className="flex gap-4">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        ) : (
          <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
            📦
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-200 truncate">{product.title || 'Untitled Product'}</h4>

          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-red-400 font-medium">{product.price || 'N/A'}</span>
            {product.original_price && (
              <span className="text-slate-500 line-through">{product.original_price}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>{product.shop_name || 'Unknown Shop'}</span>
            {product.sold_count && <span>Sold: {product.sold_count}</span>}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className={`status-badge ${product.synced ? 'status-success' : 'status-pending'}`}>
              {product.synced ? 'Synced' : 'Not Synced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
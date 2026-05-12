import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ExtractionPanel from '../components/ExtractionPanel';
import BrowserView from '../components/BrowserView';

function Dashboard() {
  const { products, loadProducts } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-1/2 border-r border-slate-700">
        <BrowserView />
      </div>

      <div className="w-1/2 flex flex-col overflow-hidden">
        <ExtractionPanel
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
        />

        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-lg font-medium mb-4 text-slate-200">Extracted Products</h3>
          {products.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No products extracted yet. Browse to a product page to start.
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  isSelected={selectedProduct?.id === product.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
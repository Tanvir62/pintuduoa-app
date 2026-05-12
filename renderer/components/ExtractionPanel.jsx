import React, { useState } from 'react';
import { useStore } from '../store/useStore';

function ExtractionPanel({ selectedProduct, onProductSelect }) {
  const {
    extractProduct,
    extractVariants,
    extractDescriptionImages,
    downloadImages,
    saveProduct,
    syncToLaravel,
    startAutoScroll,
    stopAutoScroll,
    addLog,
    currentProduct
  } = useStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({});

  const handleExtract = async () => {
    setIsExtracting(true);
    addLog('info', 'Starting product extraction...');

    try {
      const product = await extractProduct();
      if (product) {
        setExtractionProgress(prev => ({ ...prev, product: true }));
        addLog('success', 'Product extracted successfully');

        await saveProduct(product);
      }
    } catch (error) {
      addLog('error', 'Extraction failed: ' + error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractVariants = async () => {
    addLog('info', 'Extracting variants...');
    try {
      const variants = await extractVariants();
      if (variants) {
        setExtractionProgress(prev => ({ ...prev, variants: true }));
        addLog('success', `Found ${variants.length} variants`);
      }
    } catch (error) {
      addLog('error', 'Variant extraction failed: ' + error.message);
    }
  };

  const handleExtractDescription = async () => {
    addLog('info', 'Extracting description images...');
    try {
      const images = await extractDescriptionImages();
      if (images) {
        setExtractionProgress(prev => ({ ...prev, description: true }));
        addLog('success', `Found ${images.length} description images`);
      }
    } catch (error) {
      addLog('error', 'Description extraction failed: ' + error.message);
    }
  };

  const handleDownloadAll = async () => {
    if (currentProduct) {
      const allImages = [
        ...(currentProduct.sliderImages || []),
        ...(currentProduct.colorImages || []),
        ...(currentProduct.descriptionImages || [])
      ].map((url, i) => ({
        url,
        productId: currentProduct.productId,
        type: i < 10 ? 'slider' : i < 20 ? 'color' : 'description'
      }));

      if (allImages.length > 0) {
        await downloadImages(allImages, currentProduct.productId);
      }
    }
  };

  const handleSync = async () => {
    if (currentProduct) {
      await syncToLaravel(currentProduct);
    }
  };

  const handleToggleAutoScroll = () => {
    if (autoScrollEnabled) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
    setAutoScrollEnabled(!autoScrollEnabled);
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Extraction Controls</h2>
        <div className="flex items-center gap-2">
          <span className={`status-badge ${autoScrollEnabled ? 'status-success' : 'status-pending'}`}>
            Auto Scroll: {autoScrollEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleExtract}
          disabled={isExtracting}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <span>📦</span>
          <span>Extract Product</span>
        </button>

        <button
          onClick={handleExtractVariants}
          disabled={isExtracting}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <span>🎨</span>
          <span>Extract Variants</span>
        </button>

        <button
          onClick={handleExtractDescription}
          disabled={isExtracting}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <span>🖼️</span>
          <span>Extract Description</span>
        </button>

        <button
          onClick={handleDownloadAll}
          disabled={isExtracting}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <span>⬇️</span>
          <span>Download All</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSync}
          disabled={isExtracting || !currentProduct}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Sync to Laravel</span>
        </button>

        <button
          onClick={handleToggleAutoScroll}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            autoScrollEnabled
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-slate-700 hover:bg-slate-600'
          } text-white`}
        >
          <span>🔁</span>
          <span>{autoScrollEnabled ? 'Stop Auto Scroll' : 'Start Auto Scroll'}</span>
        </button>

        <button
          onClick={() => window.electronAPI.scraper.detectProductPage()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2"
        >
          <span>🔍</span>
          <span>Detect Product</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${extractionProgress.product ? 'bg-green-500' : 'bg-slate-600'}`}></div>
          <span className="text-sm text-slate-400">Product</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${extractionProgress.variants ? 'bg-green-500' : 'bg-slate-600'}`}></div>
          <span className="text-sm text-slate-400">Variants</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${extractionProgress.description ? 'bg-green-500' : 'bg-slate-600'}`}></div>
          <span className="text-sm text-slate-400">Description</span>
        </div>
      </div>
    </div>
  );
}

export default ExtractionPanel;
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

function BrowserView() {
  const { browserUrl, launchBrowser, navigateBrowser, addLog, browserLaunched } = useStore();
  const [currentUrl, setCurrentUrl] = useState(browserUrl);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (browserLaunched) {
      setCurrentUrl(browserUrl);
    }
  }, [browserUrl, browserLaunched]);

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      await launchBrowser();
      addLog('info', 'Browser launched - navigate to a product page');
    } catch (err) {
      addLog('error', 'Failed to launch browser: ' + err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${browserLaunched ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-slate-400 truncate">
            {currentUrl || 'Not connected'}
          </span>
        </div>
        <button
          onClick={() => navigateBrowser(currentUrl)}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded mr-2"
        >
          Refresh
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {!browserLaunched ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <div className="text-slate-400 mb-4">Browser not launched</div>
              <button
                onClick={handleLaunch}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-lg text-lg font-medium"
              >
                {isLoading ? 'Launching...' : 'Launch Browser'}
              </button>
              <p className="text-sm text-slate-500 mt-4">
                Click to launch Puppeteer browser
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-slate-800 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Mobile Browser Ready</h3>
                <p className="text-slate-400 mb-4">
                  Navigate to: {browserUrl}
                </p>
                <div className="bg-slate-700 p-4 rounded-lg text-sm text-slate-300 max-w-md">
                  <p className="mb-2"><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside text-left space-y-1">
                    <li>Open Pinduoduo mobile website</li>
                    <li>Login to your account</li>
                    <li>Navigate to any product page</li>
                    <li>Click "Extract Product" to begin</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-center text-xs text-slate-500">
              Puppeteer Browser Active - Use extraction controls to scrape data
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="h-10 bg-slate-800 border-t border-slate-700 flex items-center px-4 gap-2">
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigateBrowser(currentUrl)}
          placeholder="Enter URL..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white"
        />
        <button
          onClick={() => navigateBrowser(currentUrl)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Go
        </button>
      </div>
    </div>
  );
}

export default BrowserView;
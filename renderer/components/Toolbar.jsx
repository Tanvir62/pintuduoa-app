import React, { useState } from 'react';
import { useStore } from '../store/useStore';

function Toolbar() {
  const { browserUrl, setBrowserUrl, navigateBrowser, launchBrowser } = useStore();
  const [urlInput, setUrlInput] = useState('');

  const handleNavigate = () => {
    if (urlInput) {
      setBrowserUrl(urlInput);
      navigateBrowser(urlInput);
    }
  };

  const quickLinks = [
    { name: 'Pinduoduo', url: 'https://mobile.yangkeduo.com' },
    { name: 'Login', url: 'https://mobile.yangkeduo.com/login.html' },
  ];

  return (
    <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4">
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder="Enter URL..."
          className="input flex-1 max-w-md"
        />
        <button onClick={handleNavigate} className="btn-primary">
          Go
        </button>
        <button onClick={launchBrowser} className="btn-secondary">
          Launch Browser
        </button>
      </div>

      <div className="flex items-center gap-2">
        {quickLinks.map(link => (
          <button
            key={link.name}
            onClick={() => {
              setUrlInput(link.url);
              setBrowserUrl(link.url);
              navigateBrowser(link.url);
            }}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            {link.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-700 rounded-lg" title="Refresh">
          🔄
        </button>
        <button className="p-2 hover:bg-slate-700 rounded-lg" title="Settings">
          ⚙️
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
import React from 'react';

function Sidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'queue', label: 'Download Queue', icon: '⬇️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-red-500 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          PDD Scraper
        </h1>
      </div>

      <nav className="flex-1 p-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors
              ${item.id === 'dashboard' ? 'bg-red-600/20 text-red-400' : 'hover:bg-slate-700 text-slate-300'}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          <div>Version 1.0.0</div>
          <div className="mt-1">Status: Connected</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
import React from 'react';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import Console from '../components/Console';

function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar />

        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>

        <Console />
      </div>
    </div>
  );
}

export default MainLayout;
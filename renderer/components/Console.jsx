import React, { useState } from 'react';
import { useStore } from '../store/useStore';

function Console() {
  const { logs } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const getLogIcon = (level) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={`bg-slate-800 border-t border-slate-700 transition-all duration-300 ${isExpanded ? 'h-48' : 'h-10'}`}>
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💻</span>
          <span className="font-medium">Console</span>
          <span className="text-xs text-slate-500">({logs.length} logs)</span>
        </div>
        <button className="text-slate-400">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto p-2 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-4">No logs yet</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`py-1 px-2 hover:bg-slate-700 rounded ${getLogColor(log.level)}`}>
                <span className="mr-2">[{log.timestamp}]</span>
                <span className="mr-2">{getLogIcon(log.level)}</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Console;
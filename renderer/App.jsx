import React, { useState } from 'react';

function App() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const launchBrowser = async () => {
    setStatus('launching');
    addLog('Launching browser...', 'info');

    try {
      const result = await window.electronAPI.browser.launch();
      if (result.success) {
        setStatus('ready');
        addLog('Browser launched successfully!', 'success');
      } else {
        setStatus('error');
        addLog(`Failed: ${result.error}`, 'error');
      }
    } catch (error) {
      setStatus('error');
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{ background: '#0f172a', color: '#f1f5f9', padding: '20px', height: '100vh', fontFamily: 'Arial', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ color: '#ef4444' }}>Pinduoduo Scraper</h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={launchBrowser}
          disabled={status === 'launching'}
          style={{
            background: status === 'launching' ? '#6b7280' : '#ef4444',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: status === 'launching' ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {status === 'launching' ? 'Launching...' : 'Launch Browser'}
        </button>

        <span style={{
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          background: status === 'ready' ? '#22c55e' : status === 'error' ? '#ef4444' : '#6b7280',
          color: 'white'
        }}>
          {status === 'idle' ? 'IDLE' : status === 'launching' ? 'LAUNCHING' : status === 'ready' ? 'READY' : 'ERROR'}
        </span>
      </div>

      <div style={{ marginTop: '20px', flex: 1, overflow: 'auto', background: '#1e293b', borderRadius: '8px', padding: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Logs:</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '10px',
              padding: '5px 0',
              borderBottom: '1px solid #334155',
              fontSize: '13px'
            }}>
              <span style={{ color: '#64748b' }}>{log.timestamp}</span>
              <span style={{
                color: log.type === 'success' ? '#22c55e' : log.type === 'error' ? '#ef4444' : '#f1f5f9'
              }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
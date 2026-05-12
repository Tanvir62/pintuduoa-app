const path = require('path');

// Change to app directory
process.chdir(__dirname);

// Log environment
console.log('CWD:', process.cwd());
console.log('Node version:', process.version);

// Try to load electron
console.log('\nLoading electron...');
try {
  const electron = require('electron');
  console.log('Electron keys (first 10):', Object.keys(electron).slice(0, 10));
  console.log('app:', electron.app);
  console.log('app type:', typeof electron.app);
} catch (e) {
  console.error('Failed to load electron:', e.message);
}

// Try to load the main file
console.log('\nLoading main index...');
try {
  require('./electron/main/index.js');
} catch (e) {
  console.error('Failed to load main:', e.message);
  console.error(e.stack);
}
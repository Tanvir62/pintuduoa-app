const { execSync } = require('child_process');

function getListeningPid(port) {
  try {
    // Try PowerShell API first (quietly). If PowerShell isn't available or returns nothing, fall back to netstat.
    const psCommand = `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess) 2>$null"`;
    let output = null;
    try {
      output = execSync(psCommand, { encoding: 'utf8' }).trim();
    } catch (e) {
      // ignore and fall back
      output = '';
    }

    if (output) {
      const pid = Number(output);
      if (Number.isInteger(pid) && pid > 0) return pid;
    }

    // Fallback: parse netstat output (works when PowerShell cmdlets are restricted)
    const netstat = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: 'utf8' });
    const lines = netstat.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (!/LISTENING/i.test(line)) continue;
      const parts = line.split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (Number.isInteger(pid) && pid > 0) return pid;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function killPid(pid, port) {
  console.log(`Port ${port} is in use by process ${pid}; stopping it before dev startup.`);
  execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
}

const port = 5173;
const pid = getListeningPid(port);

if (pid) {
  killPid(pid, port);
}

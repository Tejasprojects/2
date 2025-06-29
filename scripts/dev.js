
#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to kill process on port
const killPort = async (port) => {
  try {
    const { exec } = require('child_process');
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout) => {
      if (!error && stdout) {
        const killCmd = process.platform === 'win32'
          ? `taskkill /PID ${stdout.split(/\s+/).pop()} /F`
          : `kill -9 ${stdout.trim()}`;
        exec(killCmd);
      }
    });
  } catch (e) {
    // Ignore errors
  }
};

// Check if .env.local exists
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env.local file not found!');
  console.log('📝 Please copy .env.example to .env.local and fill in your values:');
  console.log('   cp .env.example .env.local');
  console.log('');
}

// Check for common port conflicts and kill if needed
const checkAndKillPort = (port) => {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', async () => {
      console.log(`🔧 Port ${port} is in use. Attempting to free it...`);
      await killPort(port);
      setTimeout(() => resolve(true), 2000);
    });
  });
};

async function startDev() {
  await checkAndKillPort(8080);

  console.log('🚀 Starting QwiXEd360°Suite development server...');
  
  const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '8080'], { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..') 
  });
  
  vite.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    vite.kill();
    process.exit(0);
  });
}

startDev();

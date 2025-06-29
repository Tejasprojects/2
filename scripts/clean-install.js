
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');

console.log('🧹 Cleaning up for fresh install...');

// Remove node_modules and lock files
const cleanupPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(projectRoot, 'package-lock.json'),
  path.join(projectRoot, 'yarn.lock'),
  path.join(projectRoot, 'pnpm-lock.yaml'),
];

cleanupPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`Removing ${path.relative(projectRoot, p)}...`);
    fs.rmSync(p, { recursive: true, force: true });
  }
});

console.log('💾 Installing dependencies...');

try {
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit', 
    cwd: projectRoot 
  });
  console.log('✅ Installation completed successfully!');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('🔧 Try running: npm install --legacy-peer-deps --force');
  process.exit(1);
}

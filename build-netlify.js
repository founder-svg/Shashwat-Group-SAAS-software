const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Netlify Deployment Build Script Started ---');
console.log('Current working directory:', process.cwd());

// Determine if we are in root or in client
const inClient = fs.existsSync(path.join(process.cwd(), 'src')) && fs.existsSync(path.join(process.cwd(), 'package.json'));
const rootDir = inClient ? path.resolve(process.cwd(), '..') : process.cwd();
const clientDir = inClient ? process.cwd() : path.resolve(process.cwd(), 'client');

console.log('Root Directory:', rootDir);
console.log('Client Directory:', clientDir);

// 1. Install client dependencies
console.log('Installing client dependencies...');
execSync('npm install --legacy-peer-deps', { cwd: clientDir, stdio: 'inherit' });

// 2. Build client using Vite
console.log('Building client with Vite...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

const clientDist = path.join(clientDir, 'dist');
if (!fs.existsSync(clientDist)) {
  console.error('Build output dist folder not found at:', clientDist);
  process.exit(1);
}

// 3. Mirror the dist folder to all possible Netlify publish targets:
const targetDirs = [
  path.join(rootDir, 'dist'),
  path.join(rootDir, 'client', 'dist'),
  path.join(clientDir, 'dist'),
  path.join(clientDir, 'client', 'dist')
];

for (const target of targetDirs) {
  try {
    if (target !== clientDist) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(clientDist, target, { recursive: true });
      console.log('Successfully mirrored dist to:', target);
    }
  } catch (err) {
    console.warn('Could not mirror to', target, err.message);
  }
}

// Ensure _redirects file is present in all target dist directories
for (const target of targetDirs) {
  try {
    const redirectsPath = path.join(target, '_redirects');
    fs.writeFileSync(redirectsPath, '/* /index.html 200\n', 'utf8');
  } catch (err) {}
}

console.log('--- Netlify Deployment Build Completed Successfully ---');

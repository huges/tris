/**
 * Build script for Tris web game.
 * Packages the client distribution into `dist/` directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');
const distSrcDir = path.join(distDir, 'src');

console.log('Building Tris web game...');

// Recreate dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distSrcDir, { recursive: true });

// Copy root assets
const filesToCopy = ['index.html', 'style.css'];
for (const file of filesToCopy) {
  const srcPath = path.join(__dirname, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`Copied ${file} -> dist/${file}`);
  }
}

// Copy source JavaScript files
const srcFiles = fs.readdirSync(srcDir);
for (const file of srcFiles) {
  if (file.endsWith('.js')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(distSrcDir, file));
    console.log(`Copied src/${file} -> dist/src/${file}`);
  }
}

console.log('Build completed successfully.');

/**
 * Shared Assets Loader - prevents circular dependencies
 * P4.4: Added hot-reload support with chokidar file watcher
 */

import { readFileSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../assets');

function loadAssets() {
  const files = [
    'spelling-dict.json',
    'tone-dict.json',
    'segmentation-dict.json',
    'native-patterns.json',
    'mixing-patterns.json',
    'idioms.json',
    'regional-variants.json'
  ];

  const assets = {};
  for (const file of files) {
    try {
      const content = readFileSync(join(ASSETS_DIR, file), 'utf-8');
      const key = file
        .replace('.json', '')
        .replace(/-dict$/, 'Dict')
        .replace(/-patterns$/, 'Patterns')
        .replace(/-variants$/, 'Variants');
      assets[key] = JSON.parse(content);
    } catch (err) {
      console.warn(`[vn-lang] Failed to load ${file}:`, err.message);
      assets[key] = {};
    }
  }
  return assets;
}

let assetsCache = null;
let watchers = [];

export function getAssets() {
  if (!assetsCache) assetsCache = loadAssets();
  return assetsCache;
}

export function reloadAssets() {
  assetsCache = null;
  // Clear any existing watchers
  for (const w of watchers) {
    try { w.close(); } catch {}
  }
  watchers = [];
  return getAssets();
}

/**
 * Enable hot-reload for asset files in development mode
 * Uses chokidar if available, falls back to native fs.watch
 */
export async function enableHotReload() {
  if (process.env.NODE_ENV === 'production') return;
  
  try {
    // Try to use chokidar for better cross-platform watching
    const { default: chokidar } = await import('chokidar');
    const watcher = chokidar.watch(ASSETS_DIR, {
      ignored: /^\./,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher.on('change', (path) => {
      console.log(`[vn-lang] Asset file changed: ${path}, reloading...`);
      reloadAssets();
    });
    
    watcher.on('error', (err) => {
      console.warn('[vn-lang] File watcher error:', err.message);
    });
    
    watchers.push(watcher);
    console.log('[vn-lang] Hot reload enabled with chokidar');
  } catch (err) {
    // Fallback to native fs.watch
    console.log('[vn-lang] chokidar not available, using native fs.watch');
    const watcher = watch(ASSETS_DIR, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.json')) {
        console.log(`[vn-lang] Asset file changed: ${filename}, reloading...`);
        reloadAssets();
      }
    });
    watchers.push(watcher);
  }
}

export function disableHotReload() {
  for (const w of watchers) {
    try { w.close(); } catch {}
  }
  watchers = [];
}
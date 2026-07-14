/**
 * Shared Assets Loader - prevents circular dependencies
 */

import { readFileSync } from 'fs';
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
export function getAssets() {
  if (!assetsCache) assetsCache = loadAssets();
  return assetsCache;
}
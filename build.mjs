#!/usr/bin/env node
/**
 * Simple build script for vietnamese-language-support
 * Copies source files to dist/ without TypeScript compilation
 */

import { copyFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const ROOT = __dirname;
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const HOOKS = join(ROOT, 'hooks');
const TOOLS = join(ROOT, 'tools');
const ASSETS = join(ROOT, 'assets');

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src)) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  console.log('🔨 Building vietnamese-language-support...');

  // Clean dist
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true });
  }
  mkdirSync(DIST, { recursive: true });

  // Copy source files
  if (existsSync(SRC)) {
    copyDir(SRC, DIST);
    console.log('📦 Source copied to dist/');
  }

  // Copy hooks
  if (existsSync(HOOKS)) {
    copyDir(HOOKS, join(DIST, 'hooks'));
    console.log('🔗 Hooks copied to dist/hooks/');
  }

  // Copy tools (schemas)
  if (existsSync(TOOLS)) {
    copyDir(TOOLS, join(DIST, 'tools'));
    console.log('🔧 Tools copied to dist/tools/');
  }

  // Copy assets
  if (existsSync(ASSETS)) {
    copyDir(ASSETS, join(DIST, 'assets'));
    console.log('📚 Assets copied to dist/assets/');
  }

  // Copy skill.json
  copyFileSync(join(ROOT, 'skill.json'), join(DIST, 'skill.json'));
  console.log('📋 skill.json copied to dist/');

  // Copy health.js
  copyFileSync(join(ROOT, 'health.js'), join(DIST, 'health.js'));
  console.log('🏥 health.js copied to dist/');

  // Copy package.json
  copyFileSync(join(ROOT, 'package.json'), join(DIST, 'package.json'));
  console.log('📦 package.json copied to dist/');

  console.log('✅ Build complete');
  console.log(`   dist/index.mjs (main entry)`);
  console.log(`   dist/hooks/post_model_output.js`);
  console.log(`   dist/health.js`);
  console.log(`   dist/assets/`);
  console.log(`   dist/tools/`);
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
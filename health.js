/**
 * Health Check Endpoint for vietnamese-language-support skill
 */

import { loadAssets, healthCheck } from '../dist/index.js';

export async function healthCheckHandler(): Promise<{
  status: string;
  version: string;
  timestamp: string;
  assetsLoaded: Record<string, number>;
  uptime: number;
}> {
  const assets = loadAssets();
  const health = await healthCheck();

  return {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    assetsLoaded: {
      spellingDict: Object.keys(assets.spellingDict?.spelling || {}).length,
      toneDict: Object.keys(assets.toneDict || {}).length,
      segmentationDict: assets.segmentationDict?.compound_words?.length || 0,
      nativePatterns: Object.keys(assets.nativePatterns?.formal_to_casual || {}).length,
      mixingPatterns: (assets.mixingPatterns?.chinese_patterns?.single_chars?.length || 0) + (assets.mixingPatterns?.english_patterns?.meaningless_insertions?.length || 0),
      idioms: assets.idioms?.idioms?.length || 0,
      regionalVariants: Object.keys(assets.regionalVariants?.regions || {}).length
    },
    uptime: process.uptime()
  };
}

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheckHandler().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'healthy' ? 0 : 1);
  }).catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
}
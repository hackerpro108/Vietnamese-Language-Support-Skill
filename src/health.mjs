/**
 * Health check endpoint for vietnamese-language-support skill
 */

import { loadAssets } from './index.mjs';

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  assetsLoaded: Record<string, number>;
  uptime: number;
  timestamp: string;
}> {
  const startTime = Date.now();
  
  try {
    const assets = loadAssets();
    
    const assetsLoaded = {
      spellingDict: Object.keys(assets.spellingDict?.spelling || {}).length,
      toneDict: Object.keys(assets.toneDict || {}).length,
      segmentationDict: (assets.segmentationDict?.compound_words || []).length,
      nativePatterns: {
        formalToCasual: Object.keys(assets.nativePatterns?.formal_to_casual || {}).length,
        wordReplacements: Object.keys(assets.nativePatterns?.word_replacements || {}).length
      },
      mixingPatterns: {
        chineseChars: (assets.mixingPatterns?.chinese_patterns?.single_chars || []).length,
        englishInsertions: (assets.mixingPatterns?.english_patterns?.meaningless_insertions || []).length,
        techTerms: (assets.mixingPatterns?.english_patterns?.tech_terms || []).length
      },
      idioms: (assets.idioms?.idioms || []).length,
      regionalVariants: Object.keys(assets.regionalVariants?.regions || {}).length
    };

    return {
      status: 'healthy',
      version: '1.0.0',
      assetsLoaded,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      version: '1.0.0',
      assetsLoaded: {},
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
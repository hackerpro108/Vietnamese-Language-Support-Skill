/**
 * OpenClaw Hook: post_model_output
 * Auto-fixes Vietnamese output from any model
 */

import { fixText, loadConfig } from '../dist/index.js';

interface HookContext {
  text: string;
  agentId?: string;
  model?: string;
  metadata?: {
    formalLevel?: 'auto' | 'formal' | 'casual';
    vnLangConfig?: Partial<Config>;
    [key: string]: unknown;
  };
  logger?: {
    info: (msg: string, meta?: object) => void;
    debug: (msg: string, meta?: object) => void;
    warn: (msg: string, meta?: object) => void;
    error: (msg: string, meta?: object) => void;
  };
}

interface Config {
  dictPath?: string;
  whitelist?: string[];
  enableMixingDetection?: boolean;
  formalLevel?: 'auto' | 'formal' | 'casual';
  stripMixing?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export default async function postModelOutput(context: HookContext): Promise<{
  text: string;
  metadata: {
    vnLangApplied: boolean;
    corrections: any[];
    mixingDetected: string[];
  };
}> {
  const { text, agentId, model, metadata = {}, logger } = context;

  if (!text || typeof text !== 'string') {
    return { text, metadata: { vnLangApplied: false, corrections: [], mixingDetected: [] } };
  }

  // Skip non-Vietnamese text (heuristic: contains common Vietnamese words)
  const hasVietnamese = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(text);
  if (!hasVietnamese) {
    logger?.debug?.('vn-lang: skipped non-Vietnamese text', { agentId, model, length: text.length });
    return { text, metadata: { vnLangApplied: false, corrections: [], mixingDetected: [] } };
  }

  // Load config from metadata or defaults
  const config = loadConfig(metadata.vnLangConfig);

  const formalLevel = metadata.formalLevel || config.formalLevel || 'auto';

  const result = fixText(text, {
    fixSpelling: true,
    fixTone: true,
    fixSegmentation: true,
    stripMixing: config.stripMixing !== false,
    formalLevel
  });

  // Structured logging
  if (result.corrections.length > 0 || result.mixingIssues.length > 0) {
    logger?.info?.('vn-lang post-process', {
      agentId,
      model,
      correctionsCount: result.corrections.length,
      mixingDetected: result.mixingIssues.length > 0,
      originalLength: text.length,
      fixedLength: result.fixed.length,
      corrections: result.corrections.map(c => `${c.type}:${c.from}→${c.to}`),
      mixingTypes: result.mixingIssues.map(i => i.type)
    });
  } else {
    logger?.debug?.('vn-lang: no changes', { agentId, model });
  }

  return {
    text: result.fixed,
    metadata: {
      vnLangApplied: true,
      corrections: result.corrections,
      mixingDetected: result.mixingIssues.map(i => i.type)
    }
  };
}
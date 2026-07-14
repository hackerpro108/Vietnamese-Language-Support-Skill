// Vietnamese Language Support - TypeScript Definitions
// Generated for npm package vietnamese-language-support@1.0.0

// ============ Core Types ============

export interface FixTextOptions {
  /** Fix common spelling abbreviations (ko → không, dc → được, etc.) */
  fixSpelling?: boolean;
  /** Restore missing tone marks (Toi → Tôi, rat → rất, etc.) */
  fixTone?: boolean;
  /** Split compound words (lamviec → làm việc, caidat → cài đặt, etc.) */
  enableSegmentation?: boolean;
  /** Strip detected language mixing (Chinese chars, English filler words) */
  stripMixing?: boolean;
  /** Output formality level */
  formalLevel?: 'auto' | 'formal' | 'casual';
  /** Terms that should never be modified */
  whitelist?: string[];
  /** Domain context for vocabulary adjustments */
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance';
}

export interface FixTextResult {
  /** Original input text */
  original: string;
  /** Corrected text */
  fixed: string;
  /** Array of corrections applied */
  corrections: Correction[];
  /** Detected language mixing issues */
  mixingIssues: MixingIssue[];
  /** Native-sounding alternatives */
  nativeAlternatives: NativeAlternative[];
}

export interface CheckTextOptions {
  whitelist?: string[];
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance';
}

export interface CheckTextResult {
  original: string;
  corrections: Correction[];
  mixingIssues: MixingIssue[];
}

export interface Correction {
  type: 'spelling' | 'tone' | 'segmentation' | 'mixed_pattern' | 'domain_vocabulary' | 'passive_to_active' | 'wordy_to_concise' | 'double_negative' | 'topic_comment';
  from?: string;
  to?: string;
  original?: string;
  alternative?: string;
  context?: Record<string, unknown>;
  rule?: string;
}

export interface MixingIssue {
  type: 'chinese_sequence' | 'english_insertion' | 'mixed_pattern';
  token: string;
  start: number;
  length: number;
  context?: string;
}

export interface NativeAlternative {
  type: 'formal_to_casual' | 'word_replacement' | 'passive_to_active' | 'wordy_to_concise' | 'double_negative' | 'topic_comment' | 'pronoun_mapping' | 'domain_vocabulary' | 'formality_adjustment';
  original: string;
  alternative: string;
  fluency?: number;
  suggestedText?: string;
  context?: {
    relationship?: 'peer' | 'older' | 'younger' | 'formal';
    domain?: string;
    formality?: string;
    rule?: string;
  };
}

export interface NativeAlternativesOptions {
  /** Relationship to listener */
  relationship?: 'peer' | 'older' | 'younger' | 'formal';
  /** Domain context */
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance';
  /** Formality level */
  formality?: 'auto' | 'formal' | 'casual';
}

export interface IdiomSearchOptions {
  category?: string;
  domain?: 'general' | 'tech' | 'business' | 'lao';
  tone?: 'encouraging' | 'cautionary' | 'descriptive' | 'humorous' | 'philosophical';
  intent?: 'encourage' | 'warn' | 'describe' | 'express' | 'advise';
}

export interface IdiomEntry {
  phrase: string;
  meaning: string;
  english: string;
  category: string;
  usage: string;
  fluencyBoost?: number;
  relevance?: number;
}

export interface RegionalVariantOptions {
  /** Target region */
  region: 'north' | 'central' | 'south';
}

export interface RegionDetectionResult {
  region: 'north' | 'central' | 'south';
  confidence: number;
  scores: Record<'north' | 'central' | 'south', number>;
  markers: string[];
}

export interface RewriteSentenceOptions {
  passiveToActive?: boolean;
  wordyToConcise?: boolean;
  doubleNegative?: boolean;
  topicComment?: boolean;
}

export interface RewriteSentenceResult {
  text: string;
  changes: Array<{
    type: 'passive_to_active' | 'wordy_to_concise' | 'double_negative' | 'topic_comment';
    original: string;
    replacement: string;
  }>;
}

export interface FluencyScoreResult {
  score: number;
  tokens: string[];
}

export interface RankedAlternative {
  candidate: string;
  score: number;
}

export interface SkillConfig {
  dictPath?: string;
  whitelist?: string[];
  enableMixingDetection?: boolean;
  formalLevel?: 'auto' | 'formal' | 'casual';
  stripMixing?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded';
  version: string;
  assetsLoaded: {
    spellingDict: number;
    toneDict: number;
    segmentationDict: number;
    nativePatterns: {
      formalToCasual: number;
      wordReplacements: number;
    };
    mixingPatterns: {
      chineseChars: number;
      englishInsertions: number;
      techTerms: number;
    };
    idioms: number;
    regionalVariants: number;
  };
  domains: {
    it: number;
    lao: number;
    game: number;
    finance: number;
  };
  uptime: number;
  timestamp: string;
  metrics?: {
    avgLatencyMs: number;
    p95LatencyMs: number;
    memoryUsageMB: number;
    correctionRate: number;
    mixingDetectedRate: number;
  };
}

// ============ Domain Config Types ============

export interface DomainVocab {
  protectedTerms: string[];
  wordMap: Record<string, string>;
  phrases?: Record<string, string>;
}

export interface ITDomainConfig {
  protectedTerms: string[];
  wordReplacements: Record<string, string>;
  segmentations: Record<string, string>;
}

export interface GameDomainConfig {
  protectedTerms: string[];
  wordReplacements: Record<string, string>;
}

export interface FinanceDomainConfig {
  protectedTerms: string[];
  wordReplacements: Record<string, string>;
}

export interface LaoDomainConfig {
  protectedTerms: string[];
  phrases: Record<string, string>;
  wordMap: Record<string, string>;
}

// ============ Main Exports ============

/**
 * Fix Vietnamese text: spelling, tone marks, segmentation, language mixing
 * @param text - Input Vietnamese text
 * @param options - Processing options
 * @returns Fixed text with corrections and alternatives
 */
export function fixText(text: string, options?: FixTextOptions): FixTextResult;

/**
 * Check Vietnamese text for issues without auto-fixing
 * @param text - Input Vietnamese text
 * @param options - Check options
 * @returns Detected issues
 */
export function checkText(text: string, options?: CheckTextOptions): CheckTextResult;

/**
 * Get native-sounding alternatives for a phrase
 * @param text - Input phrase
 * @param options - Context options (relationship, domain, formality)
 * @returns Ranked alternatives with fluency scores
 */
export function getNativeAlternatives(text: string, options?: NativeAlternativesOptions): NativeAlternative[];

/**
 * Search Vietnamese idioms/proverbs by keyword
 * @param keyword - Search keyword
 * @param options - Filter options (category, domain, tone, intent)
 * @returns Matching idioms with relevance scores
 */
export function searchIdioms(keyword: string, options?: IdiomSearchOptions): IdiomEntry[];

/**
 * Get regional variant for a word/phrase
 * @param word - Word to look up
 * @param region - Target region (north/central/south)
 * @returns Regional variant or original word
 */
export function getRegionalVariant(word: string, region: 'north' | 'central' | 'south'): string;

/**
 * Auto-detect region from Vietnamese text
 * @param text - Input text
 * @returns Region with confidence and matched markers
 */
export function detectRegion(text: string): RegionDetectionResult;

/**
 * Rewrite sentence structure for better flow
 * @param text - Input sentence
 * @param options - Transformation options
 * @returns Rewritten sentence with changes list
 */
export function rewriteSentenceStructure(text: string, options?: RewriteSentenceOptions): RewriteSentenceResult;

/**
 * Alias for rewriteSentenceStructure
 */
export function rewriteSentence(text: string, options?: RewriteSentenceOptions): RewriteSentenceResult;

/**
 * Score fluency of Vietnamese text (0-1)
 * @param text - Input text
 * @returns Fluency score and token info
 */
export function scoreFluency(text: string): FluencyScoreResult;

/**
 * Rank alternative texts by fluency
 * @param candidates - Array of candidate texts
 * @param context - Optional context text
 * @returns Ranked alternatives with scores
 */
export function rankAlternatives(candidates: string[], context?: string): RankedAlternative[];

/**
 * Load skill configuration with defaults
 * @param userConfig - User-provided config overrides
 * @returns Merged configuration
 */
export function loadConfig(userConfig?: Partial<SkillConfig>): SkillConfig;

/**
 * Health check endpoint for monitoring
 * @returns Health status with asset counts and metrics
 */
export function healthCheck(): Promise<HealthCheckResult>;

/**
 * Find relevant idioms for text with context scoring
 * @param text - Input text
 * @param context - Context for ranking
 * @returns Top 5 relevant idioms
 */
export function findRelevantIdioms(text: string, context?: Record<string, unknown>): IdiomEntry[];

/**
 * Hot-reload assets without restart (development)
 * @param dir - Assets directory
 * @param callbacks - Reload callbacks
 */
export function reloadAssets(dir?: string, callbacks?: Record<string, () => void>): Promise<void>;

// ============ Domain Exports ============

export { getITDomainConfig, IT_VOCAB } from './domains/it.mjs';
export { getLaoDomainConfig, LAO_VOCAB } from './domains/lao.mjs';
export { getGameDomainConfig, GAME_VOCAB } from './domains/game.mjs';
export { getFinanceDomainConfig, FINANCE_VOCAB } from './domains/finance.mjs';

// ============ Internal (re-exported for testing) ============

export { fixSpellingAndToneOptimized as fixSpellingAndTone } from './index.mjs';
export { fixSegmentationOptimized as fixSegmentation } from './index.mjs';
export { detectMixingOptimized as detectMixing } from './index.mjs';
export { stripMixingOptimized as stripMixing } from './index.mjs';
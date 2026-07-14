/**
 * Vietnamese Language Support - Core Module (ESM)
 * 
 * Provides Vietnamese spelling/grammar correction, language mixing detection,
 * native fluency suggestions, idiom lookup, and regional variants.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../assets');

// ============ Asset Loading ============

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
function getAssets() {
  if (!assetsCache) assetsCache = loadAssets();
  return assetsCache;
}

// ============ Helpers ============

function isVietnameseWordChar(ch) {
  return /[\p{L}\p{N}_]/u.test(ch);
}

function isWordBoundary(text, index, wordLen) {
  const before = index > 0 ? text[index - 1] : '';
  const after = index + wordLen < text.length ? text[index + wordLen] : '';
  return !isVietnameseWordChar(before) && !isVietnameseWordChar(after);
}

function replaceWholeWord(text, search, replace, whitelist = []) {
  if (whitelist.length > 0 && whitelist.some(w => w.toLowerCase() === search.toLowerCase())) {
    return text;
  }
  let result = '';
  let lastIndex = 0;
  const searchLen = search.length;
  const searchLower = search.toLowerCase();

  for (let i = 0; i <= text.length - searchLen; i++) {
    if (text.slice(i, i + searchLen).toLowerCase() === searchLower && isWordBoundary(text, i, searchLen)) {
      result += text.slice(lastIndex, i) + replace;
      lastIndex = i + searchLen;
      i += searchLen - 1;
    }
  }
  result += text.slice(lastIndex);
  return result;
}

function normalizeNFC(text) {
  return text.normalize('NFC');
}

// ============ Core Functions ============

function fixSpellingAndTone(text) {
  text = normalizeNFC(text);
  const assets = getAssets();
  let result = text;
  const corrections = [];

  const allFixes = [];
  for (const [from, to] of Object.entries(assets.spellingDict?.spelling || {})) {
    if (from.length >= 2) allFixes.push({ from, to, type: 'spelling' });
  }
  for (const [from, to] of Object.entries(assets.toneDict || {})) {
    if (from.length >= 2) allFixes.push({ from, to, type: 'tone' });
  }
  allFixes.sort((a, b) => b.from.length - a.from.length);

  for (const fix of allFixes) {
    const newResult = replaceWholeWord(result, fix.from, fix.to);
    if (newResult !== result) {
      let count = 0;
      for (let i = 0; i <= result.length - fix.from.length; i++) {
        if (result.slice(i, i + fix.from.length).toLowerCase() === fix.from.toLowerCase() && isWordBoundary(result, i, fix.from.length)) {
          count++;
        }
      }
      result = newResult;
      corrections.push({ type: fix.type, from: fix.from, to: fix.to, count });
    }
  }

  return { text: result, corrections };
}

function splitCompoundWord(word) {
  const patterns = [
    /^(làm)(việc|ăn|ngủ|học|chơi)$/,
    /^(đi)(làm|học|chơi|nhau)$/,
    /^(ăn)(cơm|sáng|trưa|tối|ngon)$/,
    /^(ngủ)(ngon|sớm|muộn)$/,
    /^(học)(tập|bài|tốt)$/,
    /^(chơi)(game|nhạc|thể thao)$/,
    /^(xem)(phim|tiếp|tv)$/,
    /^(nghe)(nhạc|chuyện|radio)$/,
    /^(đọc)(sách|báo|tin)$/,
    /^(viết)(code|bài|thư)$/,
    /^(kiểm)(tra|soát)$/,
    /^(xử)(lý|lí)$/,
    /^(cài)(đặt|cài)$/,
    /^(cập)(nhật)$/,
    /^(tải)(xuống|về)$/,
    /^(đăng)(nhập|xuất|ký)$/,
    /^(thanh)(toán)$/,
    /^(chuyển)(khoản|tiền)$/,
    /^(nhận)(diện|biết)$/,
    /^(tự)(động|do)$/,
    /^(khách)(hàng)$/,
    /^(nhân)(viên)$/,
    /^(sản)(phẩm)$/,
    /^(dịch)(vụ)$/,
    /^(hỗ)(trợ)$/,
    /^(tư)(vấn)$/,
    /^(vận)(chuyển)$/,
    /^(bảo)(hành)$/,
    /^(đổi)(trả)$/
  ];

  for (const pattern of patterns) {
    const match = word.match(pattern);
    if (match) return [match[1], match[2]];
  }
  return [word];
}

function fixSegmentation(text) {
  text = normalizeNFC(text);
  const assets = getAssets();
  let result = text;
  const corrections = [];

  const compounds = Object.keys(assets.segmentationDict?.compound_words || {});
  for (const word of compounds) {
    if (word.length > 2) {
      const parts = splitCompoundWord(word);
      if (parts.length > 1) {
        const spaced = parts.join(' ');
        const newResult = replaceWholeWord(result, word, spaced);
        if (newResult !== result) {
          result = newResult;
          corrections.push({ type: 'segmentation', from: word, to: spaced });
        }
      }
    }
  }

  return { text: result, corrections };
}

// ============ Language Mixing Detection ============

function detectMixing(text) {
  text = normalizeNFC(text);
  const assets = getAssets();
  const issues = [];

  const chineseChars = assets.mixingPatterns?.chinese_patterns?.single_chars || [];
  const chineseWords = assets.mixingPatterns?.chinese_patterns?.common_words || [];
  const mixedPatterns = assets.mixingPatterns?.chinese_patterns?.mixed_patterns || [];
  const englishWords = assets.mixingPatterns?.english_patterns?.meaningless_insertions || [];
  const techTerms = new Set((assets.mixingPatterns?.english_patterns?.tech_terms || []).map(t => t.toLowerCase()));

  for (const char of chineseChars) {
    const positions = [];
    let idx = text.indexOf(char);
    while (idx !== -1) {
      positions.push(idx);
      idx = text.indexOf(char, idx + 1);
    }
    if (positions.length > 0) {
      issues.push({ type: 'chinese_char', token: char, positions });
    }
  }

  for (const word of chineseWords) {
    let idx = text.indexOf(word);
    while (idx !== -1) {
      issues.push({ type: 'chinese_word', token: word, position: idx });
      idx = text.indexOf(word, idx + 1);
    }
  }

  for (const pattern of mixedPatterns) {
    let idx = text.indexOf(pattern);
    while (idx !== -1) {
      issues.push({ type: 'mixed_pattern', token: pattern, position: idx });
      idx = text.indexOf(pattern, idx + 1);
    }
  }

  const words = text.split(/(\s+)/);
  let pos = 0;
  for (const word of words) {
    if (word.trim()) {
      const clean = word.toLowerCase().replace(/[.,!?;:()[\]{}"']/g, '');
      if (englishWords.includes(clean) && !techTerms.has(clean)) {
        issues.push({ type: 'english_insertion', token: word, position: pos });
      }
      pos += word.length;
    } else {
      pos += word.length;
    }
  }

  return issues;
}

function stripMixing(text, whitelist = []) {
  let result = normalizeNFC(text);
  const issues = detectMixing(result);

  issues.sort((a, b) => {
    const posA = a.positions ? Math.max(...a.positions) : (a.position || 0);
    const posB = b.positions ? Math.max(...b.positions) : (b.position || 0);
    return posB - posA;
  });

  for (const issue of issues) {
    if (whitelist.length > 0 && whitelist.some(w => w.toLowerCase() === issue.token.toLowerCase())) {
      continue;
    }
    if (issue.type === 'chinese_char') {
      for (const pos of [...issue.positions].sort((a, b) => b - a)) {
        result = result.slice(0, pos) + result.slice(pos + 1);
      }
    } else if (issue.type === 'chinese_word' || issue.type === 'mixed_pattern') {
      result = result.replace(new RegExp(issue.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    } else if (issue.type === 'english_insertion') {
      result = replaceWholeWord(result, issue.token, '', whitelist);
    }
  }

  result = result.replace(/\s+/g, ' ').trim();
  return { text: result, issues };
}

// ============ Native Alternatives ============

function getNativeAlternatives(text) {
  text = normalizeNFC(text);
  const assets = getAssets();
  const alternatives = [];

  const formalToCasual = assets.nativePatterns?.formal_to_casual || {};
  for (const [formal, casuals] of Object.entries(formalToCasual)) {
    if (text.includes(formal)) {
      alternatives.push({
        type: 'formal_to_casual',
        original: formal,
        alternatives: casuals,
        context: text.replace(formal, casuals[0])
      });
    }
  }

  const wordReplacements = assets.nativePatterns?.word_replacements || {};
  for (const [word, replacements] of Object.entries(wordReplacements)) {
    const altArray = Array.isArray(replacements) ? replacements : [replacements];
    for (let i = 0; i <= text.length - word.length; i++) {
      if (text.slice(i, i + word.length).toLowerCase() === word.toLowerCase() && isWordBoundary(text, i, word.length)) {
        alternatives.push({
          type: 'word_replacement',
          original: word,
          alternatives: altArray,
          context: text.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), altArray[0])
        });
        break;
      }
    }
  }

  const passiveToActive = assets.nativePatterns?.sentence_structures?.passive_to_active || {};
  for (const [passive, active] of Object.entries(passiveToActive)) {
    if (text.includes(passive)) {
      alternatives.push({ type: 'passive_to_active', original: passive, alternative: active });
    }
  }

  const wordyToConcise = assets.nativePatterns?.sentence_structures?.wordy_to_concise || {};
  for (const [wordy, concise] of Object.entries(wordyToConcise)) {
    if (text.includes(wordy)) {
      alternatives.push({ type: 'wordy_to_concise', original: wordy, alternative: concise });
    }
  }

  return alternatives;
}

// ============ Public API ============

export function fixText(text, options = {}) {
  const {
    fixSpelling = true,
    fixTone = true,
    enableSegmentation = true,
    stripMixing: doStripMixing = true,
    formalLevel = 'auto',
    whitelist = []
  } = options;

  let result = normalizeNFC(text);
  const allCorrections = [];
  let allMixingIssues = [];

  if (fixSpelling || fixTone) {
    const { text: fixed, corrections } = fixSpellingAndTone(result);
    result = fixed;
    allCorrections.push(...corrections);
  }

  if (enableSegmentation) {
    const { text: fixed, corrections } = fixSegmentation(result);
    result = fixed;
    allCorrections.push(...corrections);
  }

  if (doStripMixing) {
    const { text: fixed, issues } = stripMixing(result, whitelist);
    result = fixed;
    allMixingIssues.push(...issues);
  }

  const alternatives = getNativeAlternatives(result);

  return {
    original: text,
    fixed: result,
    corrections: allCorrections,
    mixingIssues: allMixingIssues,
    nativeAlternatives: alternatives
  };
}

export function checkText(text) {
  text = normalizeNFC(text);
  const { text: fixed, corrections } = fixSpellingAndTone(text);
  const { text: segmented, corrections: segCorrections } = fixSegmentation(fixed);
  const issues = detectMixing(segmented);

  return {
    original: text,
    corrections: [...corrections, ...segCorrections],
    mixingIssues: issues
  };
}

export { fixSpellingAndTone, fixSegmentation, getNativeAlternatives, detectMixing, stripMixing };

export function searchIdioms(keyword) {
  const assets = getAssets();
  const results = [];
  const kw = normalizeNFC(keyword).toLowerCase();

  for (const idiom of assets.idioms?.idioms || []) {
    const haystack = `${idiom.phrase} ${idiom.meaning} ${idiom.english} ${idiom.category} ${idiom.usage || ''}`.toLowerCase();
    if (haystack.includes(kw)) results.push(idiom);
  }

  for (const proverb of assets.idioms?.proverbs || []) {
    const haystack = `${proverb.phrase} ${proverb.meaning}`.toLowerCase();
    if (haystack.includes(kw)) {
      results.push({ ...proverb, category: 'proverb', english: '', usage: '' });
    }
  }

  return results;
}

export function getRegionalVariant(word, region) {
  word = normalizeNFC(word);
  const assets = getAssets();
  const regionData = assets.regionalVariants?.regions?.[region];
  if (!regionData) return word;

  const vocab = regionData.vocabulary || {};
  if (vocab[word]) return vocab[word];

  for (const [key, value] of Object.entries(vocab)) {
    if (key.toLowerCase() === word.toLowerCase()) return value;
  }

  const phrases = regionData.phrases || {};
  if (phrases[word]) return phrases[word];

  return word;
}

export function loadConfig(userConfig = {}) {
  const defaults = {
    dictPath: 'assets',
    whitelist: [
      'API', 'React', 'TypeScript', 'NextJS', 'VionSky', 'OpenClaw', 'Nemotron', 'Gemma', 'Ollama',
      'Prisma', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'GitHub', 'GitLab',
      'npm', 'Yarn', 'PNPM', 'Bun', 'Deno', 'NodeJS', 'JavaScript', 'Python', 'Go', 'Rust', 'Java',
      'Kotlin', 'Swift', 'C#', 'PHP', 'Ruby', 'HTML', 'CSS', 'JSON', 'YAML', 'TOML', 'SQL',
      'GraphQL', 'REST', 'gRPC', 'WebSocket', 'TCP', 'UDP', 'HTTP', 'HTTPS', 'SSL', 'TLS',
      'JWT', 'OAuth', 'OIDC', 'SAML', 'LDAP', 'RBAC', 'ABAC', 'CI', 'CD', 'DNS', 'VPC', 'IAM',
      'S3', 'EC2', 'Lambda', 'RDS', 'CloudFormation', 'CloudWatch', 'Config', 'SSM', 'KMS'
    ],
    enableMixingDetection: true,
    formalLevel: 'auto',
    stripMixing: true,
    logLevel: 'info'
  };

  return { ...defaults, ...userConfig };
}

export async function healthCheck() {
  const assets = getAssets();
  return {
    status: 'healthy',
    version: '1.0.0',
    assetsLoaded: {
      spellingDict: Object.keys(assets.spellingDict?.spelling || {}).length,
      toneDict: Object.keys(assets.toneDict || {}).length,
      segmentationDict: Object.keys(assets.segmentationDict?.compound_words || {}).length,
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
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

// ============ CLI Entry Point (conditional) ============

// Only import CLI when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./cli.mjs');
}

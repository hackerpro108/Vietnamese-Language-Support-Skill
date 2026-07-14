#!/usr/bin/env node
/**
 * Vietnamese Language Support CLI
 * Fix spelling, grammar, tone marks, detect language mixing, suggest native alternatives
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');

function loadAssets() {
  const assets = {};
  const files = [
    'spelling-dict.json',
    'tone-dict.json',
    'segmentation-dict.json',
    'native-patterns.json',
    'mixing-patterns.json',
    'idioms.json',
    'regional-variants.json'
  ];

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      assets[file.replace('.json', '')] = JSON.parse(content);
    } catch (err) {
      console.error(`Warning: Could not load ${file}:`, err.message);
      assets[file.replace('.json', '')] = {};
    }
  }
  return assets;
}

const ASSETS = loadAssets();

// Escape regex special chars
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Vietnamese-aware word boundary check
function isWordBoundary(text, index, wordLen) {
  const before = index > 0 ? text[index - 1] : '';
  const after = index + wordLen < text.length ? text[index + wordLen] : '';
  const isWordChar = (ch) => /[\p{L}\p{N}_]/u.test(ch);
  return !isWordChar(before) && !isWordChar(after);
}

// Safe replace all occurrences of a word (not substring)
function replaceWholeWord(text, search, replace) {
  let result = '';
  let lastIndex = 0;
  const searchLen = search.length;

  for (let i = 0; i <= text.length - searchLen; i++) {
    if (text.slice(i, i + searchLen).toLowerCase() === search.toLowerCase() && isWordBoundary(text, i, searchLen)) {
      result += text.slice(lastIndex, i) + replace;
      lastIndex = i + searchLen;
      i += searchLen - 1;
    }
  }
  result += text.slice(lastIndex);
  return result;
}

// 1. Fix spelling and tone marks
function fixSpellingAndTone(text) {
  let result = text;
  const corrections = [];

  const spellingDict = ASSETS['spelling-dict']?.spelling || {};
  const toneDict = ASSETS['tone-dict'] || {};

  // Combine and sort by length desc
  const allFixes = [];
  for (const [wrong, correct] of Object.entries(spellingDict)) {
    if (wrong.length >= 2) allFixes.push({ from: wrong, to: correct, type: 'spelling' });
  }
  for (const [unaccented, accented] of Object.entries(toneDict)) {
    if (unaccented.length >= 2) allFixes.push({ from: unaccented, to: accented, type: 'tone' });
  }
  allFixes.sort((a, b) => b.from.length - a.from.length);

  for (const fix of allFixes) {
    const newResult = replaceWholeWord(result, fix.from, fix.to);
    if (newResult !== result) {
      // Count how many replacements
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

// 2. Fix segmentation
function fixSegmentation(text) {
  let result = text;
  const corrections = [];

  const compounds = ASSETS['segmentation-dict']?.compound_words || [];
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

// 3. Detect language mixing
function detectMixing(text) {
  const issues = [];
  const chineseChars = ASSETS['mixing-patterns']?.chinese_patterns?.single_chars || [];
  const chineseWords = ASSETS['mixing-patterns']?.chinese_patterns?.common_words || [];
  const mixedPatterns = ASSETS['mixing-patterns']?.chinese_patterns?.mixed_patterns || [];
  const englishWords = ASSETS['mixing-patterns']?.english_patterns?.meaningless_insertions || [];
  const techTerms = new Set((ASSETS['mixing-patterns']?.english_patterns?.tech_terms || []).map(t => t.toLowerCase()));

  // Chinese chars
  for (const char of chineseChars) {
    const indices = [];
    let idx = text.indexOf(char);
    while (idx !== -1) {
      indices.push(idx);
      idx = text.indexOf(char, idx + 1);
    }
    if (indices.length > 0) issues.push({ type: 'chinese_char', token: char, positions: indices });
  }

  // Chinese words
  for (const word of chineseWords) {
    let idx = text.indexOf(word);
    while (idx !== -1) {
      issues.push({ type: 'chinese_word', token: word, position: idx });
      idx = text.indexOf(word, idx + 1);
    }
  }

  // Mixed patterns
  for (const pattern of mixedPatterns) {
    let idx = text.indexOf(pattern);
    while (idx !== -1) {
      issues.push({ type: 'mixed_pattern', token: pattern, position: idx });
      idx = text.indexOf(pattern, idx + 1);
    }
  }

  // English insertions
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

// 4. Strip mixing
function stripMixing(text) {
  let result = text;
  const issues = detectMixing(text);

  // Sort by position desc
  issues.sort((a, b) => {
    const posA = a.positions ? Math.max(...a.positions) : (a.position || 0);
    const posB = b.positions ? Math.max(...b.positions) : (b.position || 0);
    return posB - posA;
  });

  for (const issue of issues) {
    if (issue.type === 'chinese_char') {
      // Sort positions descending so removing earlier chars doesn't shift later indices
      for (const pos of [...issue.positions].sort((a, b) => b - a)) {
        result = result.slice(0, pos) + result.slice(pos + 1);
      }
    } else if (issue.type === 'chinese_word' || issue.type === 'mixed_pattern') {
      result = result.replace(new RegExp(escapeRegExp(issue.token), 'g'), '');
    } else if (issue.type === 'english_insertion') {
      result = replaceWholeWord(result, issue.token, '');
    }
  }

  result = result.replace(/\s+/g, ' ').trim();
  return { text: result, issues };
}

// 5. Get native alternatives
function getNativeAlternatives(text) {
  const alternatives = [];
  const formalToCasual = ASSETS['native-patterns']?.formal_to_casual || {};

  for (const [formal, casualOptions] of Object.entries(formalToCasual)) {
    if (text.includes(formal)) {
      alternatives.push({
        type: 'formal_to_casual',
        original: formal,
        alternatives: casualOptions,
        context: text.replace(formal, casualOptions[0])
      });
    }
  }

  const wordReplacements = ASSETS['native-patterns']?.word_replacements || {};
  for (const [word, replacements] of Object.entries(wordReplacements)) {
    // Check if word appears as whole word
    for (let i = 0; i <= text.length - word.length; i++) {
      if (text.slice(i, i + word.length).toLowerCase() === word.toLowerCase() && isWordBoundary(text, i, word.length)) {
        const altArray = Array.isArray(replacements) ? replacements : [replacements];
        alternatives.push({
          type: 'word_replacement',
          original: word,
          alternatives: altArray,
          context: text.replace(new RegExp(escapeRegExp(word), 'i'), altArray[0])
        });
        break;
      }
    }
  }

  const passiveToActive = ASSETS['native-patterns']?.sentence_structures?.passive_to_active || {};
  for (const [passive, active] of Object.entries(passiveToActive)) {
    if (text.includes(passive)) {
      alternatives.push({ type: 'passive_to_active', original: passive, alternative: active });
    }
  }

  return alternatives;
}

// 6. Search idioms
function searchIdioms(keyword) {
  const results = [];
  const idioms = ASSETS['idioms']?.idioms || [];
  const proverbs = ASSETS['idioms']?.proverbs || [];
  const kw = keyword.toLowerCase();

  for (const item of [...idioms, ...proverbs]) {
    const haystack = `${item.phrase} ${item.meaning} ${item.english || ''} ${item.category || ''}`.toLowerCase();
    if (haystack.includes(kw)) results.push(item);
  }
  return results;
}

// 7. Regional variant
function getRegionalVariant(word, region) {
  const regions = ASSETS['regional-variants']?.regions || {};
  const regionData = regions[region] || regions.north;
  return regionData.vocabulary?.[word] || regionData.phrases?.[word] || word;
}

// Full pipeline
function fixText(text, options = {}) {
  let result = text;
  const allCorrections = [];
  const allIssues = [];

  if (options.fixSpelling !== false) {
    const { text: fixed, corrections } = fixSpellingAndTone(result);
    result = fixed;
    allCorrections.push(...corrections);
  }

  if (options.fixSegmentation !== false) {
    const { text: fixed, corrections } = fixSegmentation(result);
    result = fixed;
    allCorrections.push(...corrections);
  }

  if (options.stripMixing !== false) {
    const { text: fixed, issues } = stripMixing(result);
    result = fixed;
    allIssues.push(...issues);
  }

  const nativeAlts = getNativeAlternatives(result);

  return { original: text, fixed: result, corrections: allCorrections, mixingIssues: allIssues, nativeAlternatives: nativeAlts };

  const alternatives = getNativeAlternatives(result);

  return { original: text, fixed: result, corrections: allCorrections, mixingIssues: allIssues, nativeAlternatives: alternatives };
}

// ============ CLI ============

function printUsage() {
  console.log(`
Vietnamese Language Support CLI

Usage:
  vn-lang fix <text>           Fix spelling, grammar, tone marks, strip mixing
  vn-lang check <text>         Analyze text for issues (no auto-fix)
  vn-lang native <phrase>      Get native alternatives for a phrase
  vn-lang idiom <keyword>      Search Vietnamese idioms/proverbs
  vn-lang region <word> <region> Get regional variant (north/central/south)
  vn-lang help                 Show this help

Examples:
  vn-lang fix "Model的 này hơi yếu tiếng Việt的"
  vn-lang check "Tôi think rằng này okay"
  vn-lang native "Tôi nghĩ là"
  vn-lang idiom "kiên trì"
  vn-lang region "bây giờ" south
`);
}

function cmdFix(text) {
  const result = fixText(text);
  console.log('Original:', result.original);
  console.log('Fixed:   ', result.fixed);
  if (result.corrections.length > 0) {
    console.log('\nCorrections:');
    for (const c of result.corrections) {
      console.log(`  - ${c.type}: "${c.from}" → "${c.to}"${c.count > 1 ? ` (${c.count}x)` : ''}`);
    }
  }
  if (result.mixingIssues.length > 0) {
    console.log('\nLanguage Mixing Detected:');
    for (const i of result.mixingIssues) {
      const pos = i.positions ? i.positions.join(', ') : i.position;
      console.log(`  - ${i.type}: "${i.token}" at position(s) ${pos}`);
    }
  }
  if (result.nativeAlternatives.length > 0) {
    console.log('\nNative Alternatives:');
    for (const a of result.nativeAlternatives) {
      if (a.alternatives) {
        console.log(`  - ${a.type}: "${a.original}" → ${a.alternatives.join(', ')}`);
      } else {
        console.log(`  - ${a.type}: "${a.original}" → "${a.alternative}"`);
      }
      if (a.context) console.log(`    Context: ${a.context}`);
    }
  }
}

function cmdCheck(text) {
  const { text: fixed, corrections } = fixSpellingAndTone(text);
  const { text: segmented, corrections: segCorrections } = fixSegmentation(fixed);
  const issues = detectMixing(segmented);

  console.log('Original:', text);
  console.log('\nIssues Found:');
  let hasIssues = false;
  if (corrections.length > 0) {
    console.log('  Spelling/Tone:');
    for (const c of corrections) console.log(`    - ${c.type}: "${c.from}" → "${c.to}"`);
    hasIssues = true;
  }
  if (segCorrections.length > 0) {
    console.log('  Segmentation:');
    for (const c of segCorrections) console.log(`    - ${c.type}: "${c.from}" → "${c.to}"`);
    hasIssues = true;
  }
  if (issues.length > 0) {
    console.log('  Language Mixing:');
    for (const issue of issues) {
      const pos = issue.positions ? issue.positions.join(', ') : issue.position;
      console.log(`    - ${issue.type}: "${issue.token}" at ${pos}`);
    }
    hasIssues = true;
  }
  if (!hasIssues) console.log('  None!');
}

function cmdNative(phrase) {
  const alternatives = getNativeAlternatives(phrase);
  console.log('Phrase:', phrase);
  console.log('\nNative Alternatives:');
  if (alternatives.length > 0) {
    for (const a of alternatives) {
      if (a.alternatives) {
        console.log(`  - ${a.type}: "${a.original}" → ${a.alternatives.join(', ')}`);
      } else {
        console.log(`  - ${a.type}: "${a.original}" → "${a.alternative}"`);
      }
      if (a.context) console.log(`    Context: ${a.context}`);
    }
  } else {
    console.log('  No alternatives found.');
  }
}

function cmdIdiom(keyword) {
  const results = searchIdioms(keyword);
  console.log(`Idioms matching "${keyword}":`);
  if (results.length > 0) {
    for (const r of results) {
      console.log(`\n  ${r.phrase}`);
      console.log(`  Nghĩa: ${r.meaning}`);
      console.log(`  English: ${r.english}`);
      console.log(`  Category: ${r.category}`);
      if (r.usage) console.log(`  Usage: ${r.usage}`);
    }
  } else {
    console.log('  No idioms found.');
  }
}

function cmdRegion(word, region) {
  const variant = getRegionalVariant(word, region);
  console.log(`Word: "${word}" in ${region}`);
  if (variant) console.log(`Variant: ${variant}`);
  else console.log('No variant found.');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'fix':
      if (args.length < 2) { console.error('Error: Missing text'); printUsage(); process.exit(1); }
      cmdFix(args.slice(1).join(' '));
      break;
    case 'check':
      if (args.length < 2) { console.error('Error: Missing text'); printUsage(); process.exit(1); }
      cmdCheck(args.slice(1).join(' '));
      break;
    case 'native':
      if (args.length < 2) { console.error('Error: Missing phrase'); printUsage(); process.exit(1); }
      cmdNative(args.slice(1).join(' '));
      break;
    case 'idiom':
      if (args.length < 2) { console.error('Error: Missing keyword'); printUsage(); process.exit(1); }
      cmdIdiom(args.slice(1).join(' '));
      break;
    case 'region':
      if (args.length < 3) { console.error('Error: Missing word/region'); printUsage(); process.exit(1); }
      cmdRegion(args[1], args[2]);
      break;
    case 'help':
    default:
      printUsage();
      break;
  }
}

main();
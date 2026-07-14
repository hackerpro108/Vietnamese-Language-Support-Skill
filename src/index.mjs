/**
 * Vietnamese Language Support - Core Module (ESM) - OPTIMIZED
 * 
 * Provides Vietnamese spelling/grammar correction, language mixing detection,
 * native fluency suggestions, idiom lookup, regional variants, and domain specialization.
 * 
 * P4.1: Optimized with Trie-based dictionary lookups for <5ms p95 latency
 * P2.1: N-gram Fluency Scoring (3-gram model)
 * P2.2: Context-aware Native Alternatives (relationship, domain, formality)
 * P3.1: IT/Dev Domain Corpus
 * P3.2: Lao Language Context
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scoreFluency, rankAlternatives } from './fluency.mjs';
import { findRelevantIdioms } from './idiom.mjs';
import { detectRegion } from './region.mjs';
import { rewriteSentenceStructure as rewriteSentence } from './rewriter.mjs';
import { getAssets, reloadAssets } from './assets.mjs';
import { getITDomainConfig, IT_VOCAB } from './domains/it.mjs';
import { getLaoDomainConfig, LAO_VOCAB } from './domains/lao.mjs';
import { getGameDomainConfig, GAME_VOCAB } from './domains/game.mjs';
import { getFinanceDomainConfig, FINANCE_VOCAB } from './domains/finance.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../assets');
const NATIVE_PATTERNS_PATH = join(ASSETS_DIR, 'native-patterns.json');

// ============ Domain-specific Word-level Domain Vocabulary (P2.2 + P3.1) ============

const DOMAIN_VOCABULARY = {
  tech: {
    'cài': 'cài đặt', 'xóa': 'xoá', 'sửa': 'chỉnh sửa', 'chạy': 'thực thi',
    'build': 'build', 'deploy': 'triển khai', 'debug': 'gỡ lỗi', 'fix': 'sửa lỗi',
    'test': 'kiểm thử', 'run': 'chạy', 'start': 'khởi động', 'stop': 'dừng',
    'restart': 'khởi động lại', 'update': 'cập nhật', 'upgrade': 'nâng cấp',
    'install': 'cài đặt', 'uninstall': 'gỡ cài đặt', 'config': 'cấu hình',
    'setting': 'cài đặt', 'env': 'biến môi trường', 'variable': 'biến',
    'function': 'hàm', 'method': 'phương thức', 'class': 'lớp', 'object': 'đối tượng',
    'api': 'API', 'endpoint': 'điểm cuối', 'request': 'yêu cầu', 'response': 'phản hồi',
    'server': 'máy chủ', 'client': 'máy khách', 'database': 'cơ sở dữ liệu',
    'cache': 'bộ nhớ đệm', 'token': 'token', 'auth': 'xác thực', 'login': 'đăng nhập',
    'logout': 'đăng xuất', 'register': 'đăng ký', 'session': 'phiên', 'cookie': 'cookie',
    'header': 'tiêu đề', 'body': 'phần thân', 'query': 'truy vấn', 'param': 'tham số',
    'error': 'lỗi', 'exception': 'ngoại lệ', 'bug': 'lỗi', 'issue': 'vấn đề',
    'feature': 'tính năng', 'commit': 'commit', 'push': 'đẩy', 'pull': 'kéo',
    'merge': 'ghép', 'branch': 'nhánh', 'pr': 'pull request', 'review': 'xem xét',
    'approve': 'phê duyệt', 'deploy': 'triển khai', 'release': 'phát hành',
    'version': 'phiên bản', 'changelog': 'nhật ký thay đổi',
  },
  business: {
    'mua': 'đặt hàng', 'bán': 'phân phối', 'khách': 'khách hàng', 'hàng hóa': 'sản phẩm',
    'giá': 'giá cả', 'giảm giá': 'khuyến mãi', 'sale': 'khuyến mãi', 'discount': 'giảm giá',
    'order': 'đơn hàng', 'invoice': 'hóa đơn', 'payment': 'thanh toán', 'receipt': 'biên lai',
    'refund': 'hoàn tiền', 'return': 'trả hàng', 'exchange': 'đổi hàng', 'warranty': 'bảo hành',
    'support': 'hỗ trợ', 'contact': 'liên hệ', 'contract': 'hợp đồng', 'deal': 'thỏa thuận',
    'partner': 'đối tác', 'vendor': 'nhà cung cấp', 'supplier': 'nhà cung cấp',
    'revenue': 'doanh thu', 'profit': 'lợi nhuận', 'cost': 'chi phí', 'budget': 'ngân sách',
    'forecast': 'dự báo', 'target': 'mục tiêu', 'kpi': 'KPI', 'metric': 'chỉ số',
    'report': 'báo cáo', 'meeting': 'cuộc họp', 'deadline': 'hạn chót', 'schedule': 'lịch trình',
    'timeline': 'dòng thời gian', 'milestone': 'cột mốc', 'deliverable': 'kết quả giao',
  },
  lao: {
    'xin chào': 'ສະບາຍດີ (sabaidi)', 'cảm ơn': 'ຂອບໃຈ (khob chai)',
    'xin lỗi': 'ຂໍໂທດ (kho thot)', 'tạm biệt': 'ລາກ່າ (la ka)',
    'bạn khỏe không': 'ເຈົ້າສະບາຍດີບໍ (chao sabaidi bo)',
    'tôi hiểu': 'ຂ້ອຍເຂົ້າໃຈ (khoy khao jai)',
    'tôi không hiểu': 'ຂ້ອຍບໍ່ເຂົ້າໃຈ (khoy bo khao jai)',
    'bao nhiêu tiền': 'ທີ່ໃດ (thi dai)', 'đắt quá': 'ແພງເກີນ (phaeng khuen)',
    'rẻ hơn được không': 'ຂໍໃຫໝົດໄດ້ບໍ (kho ham lot dai bo)',
    'nước': 'ນ້ຳ (nam)', 'cơm': 'ເຂົ້າໜຽມ (khao niam)',
    'đi': 'ໄປ (pai)', 'đến': 'ມາ (ma)', 'xe': 'ລົດ (lot)',
    'xe buýt': 'ລົດເມ (lot me)', 'sân bay': 'ສະຫນາມບິນ (sanam bin)',
    'khách sạn': 'ໂຮງແຮມ (hong haem)', 'phòng': 'ຫ້ອງ (hong)',
    'ngủ': 'ນອນ (non)', 'ăn': 'ກິນ (kin)', 'uống': 'ດື່ມ (duem)',
    'đẹp': 'ງາມ (ngam)', 'xấu': 'ບໍ່ງາມ (bo ngam)',
    'to': 'ໃຫຍ່ (nyai)', 'nhỏ': 'ເນື້ອຍ (nuea)',
    'nóng': 'ຮ້ອນ (hon)', 'lạnh': 'ເຢັນ (yen)',
  }
};

// ============ Domain Exports (P3.1 + P3.2) ============

export { getITDomainConfig, IT_VOCAB };
export { getLaoDomainConfig, LAO_VOCAB };
export { getGameDomainConfig, GAME_VOCAB };
export { getFinanceDomainConfig, FINANCE_VOCAB };

// ============ Pronoun Mapping by Relationship (P2.2) ============

const PRONOUN_MAP = {
  peer: { 'tôi': 'mình', 'bạn': 'bạn', 'anh': 'anh', 'chị': 'chị', 'em': 'em', 'tao': 'mình', 'tui': 'mình' },
  older: { 'tôi': 'em', 'bạn': 'anh/chị', 'anh': 'anh', 'chị': 'chị', 'em': 'em', 'tao': 'em', 'tui': 'em' },
  younger: { 'tôi': 'anh/chị', 'bạn': 'em', 'anh': 'anh', 'chị': 'chị', 'em': 'em', 'tao': 'anh/chị', 'tui': 'anh/chị' },
  formal: { 'tôi': 'tôi', 'bạn': 'bạn', 'anh': 'anh', 'chị': 'chị', 'em': 'em', 'tao': 'tôi', 'tui': 'tôi' },
};

// ============ Trie Data Structure for Fast Dictionary Lookups ============

class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
    this.value = null;
    this.type = null; // 'spelling', 'tone', 'segmentation', 'native', 'domain'
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.maxKeyLength = 0;
  }

  insert(key, value, type) {
    let node = this.root;
    for (const char of key.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
    node.value = value;
    node.type = type;
    this.maxKeyLength = Math.max(this.maxKeyLength, key.length);
  }

  /**
   * Find all matches in text starting from position
   * Returns array of {key, value, type, length}
   */
  findAll(text, start) {
    const results = [];
    let node = this.root;
    let currentKey = '';
    
    for (let i = start; i < text.length && i - start < this.maxKeyLength; i++) {
      const char = text[i].toLowerCase();
      if (!node.children.has(char)) break;
      
      node = node.children.get(char);
      currentKey += text[i];
      
      if (node.isEnd) {
        // Check word boundary
        if (isWordBoundary(text, start, currentKey.length)) {
          results.push({ key: currentKey, value: node.value, type: node.type, length: currentKey.length });
        }
      }
    }
    return results;
  }
}

// Build tries on first use
let triesCache = null;

function buildTries() {
  if (triesCache) return triesCache;
  
  const assets = getAssets();
  const tries = {
    spellingTone: new Trie(),
    segmentation: new Trie(),
    nativeFormalToCasual: new Trie(),
    nativeWordReplacements: new Trie(),
    domainIT: new Trie(),
    domainGame: new Trie(),
    domainFinance: new Trie(),
    domainLao: new Trie(),
    domainTech: new Trie(),
    domainBusiness: new Trie(),
  };

  // Spelling dictionary
  for (const [from, to] of Object.entries(assets.spellingDict?.spelling || {})) {
    if (from.length >= 2) tries.spellingTone.insert(from, to, 'spelling');
  }
  // Tone dictionary
  for (const [from, to] of Object.entries(assets.toneDict || {})) {
    if (from.length >= 2) tries.spellingTone.insert(from, to, 'tone');
  }
  // Segmentation compounds
  for (const compound of Object.keys(assets.segmentationDict?.compound_words || {})) {
    if (compound.length > 2) tries.segmentation.insert(compound, compound, 'segmentation');
  }
  // Native patterns - formal to casual
  for (const [formal, casuals] of Object.entries(assets.nativePatterns?.formal_to_casual || {})) {
    const casual = Array.isArray(casuals) ? casuals[0] : casuals;
    tries.nativeFormalToCasual.insert(formal, casual, 'formal_to_casual');
  }
  // Native patterns - word replacements
  for (const [word, replacements] of Object.entries(assets.nativePatterns?.word_replacements || {})) {
    const rep = Array.isArray(replacements) ? replacements[0] : replacements;
    tries.nativeWordReplacements.insert(word, rep, 'word_replacement');
  }
  // Domain vocabularies
  for (const [from, to] of Object.entries(IT_VOCAB.wordReplacements || {})) {
    tries.domainIT.insert(from, to, 'domain_it');
  }
  for (const [from, to] of Object.entries(GAME_VOCAB.wordReplacements || {})) {
    tries.domainGame.insert(from, to, 'domain_game');
  }
  for (const [from, to] of Object.entries(FINANCE_VOCAB.wordReplacements || {})) {
    tries.domainFinance.insert(from, to, 'domain_finance');
  }
  for (const [from, to] of Object.entries(LAO_VOCAB.wordMap || {})) {
    tries.domainLao.insert(from, to, 'domain_lao');
  }
  for (const [from, to] of Object.entries(DOMAIN_VOCABULARY.tech || {})) {
    tries.domainTech.insert(from, to, 'domain_tech');
  }
  for (const [from, to] of Object.entries(DOMAIN_VOCABULARY.business || {})) {
    tries.domainBusiness.insert(from, to, 'domain_business');
  }

  triesCache = tries;
  return tries;
}

function clearTriesCache() {
  triesCache = null;
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

function normalizeNFC(text) {
  return text.normalize('NFC');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============ Domain Integration Helpers ============

function getDomainProtectedTerms(domain) {
  if (domain === 'it') return IT_VOCAB.protectedTerms;
  if (domain === 'lao') return Object.keys(LAO_VOCAB.phrases).concat(Object.keys(LAO_VOCAB.wordMap));
  if (domain === 'game') return GAME_VOCAB.protectedTerms;
  if (domain === 'finance') return FINANCE_VOCAB.protectedTerms;
  return [];
}

function getDomainWordReplacements(domain) {
  if (domain === 'it') return IT_VOCAB.wordReplacements;
  if (domain === 'lao') return LAO_VOCAB.wordMap;
  if (domain === 'game') return GAME_VOCAB.wordReplacements;
  if (domain === 'finance') return FINANCE_VOCAB.wordReplacements;
  return DOMAIN_VOCABULARY[domain] || {};
}

function getDomainFormalToCasual(domain) {
  if (domain === 'it') return IT_VOCAB.formalToCasual;
  if (domain === 'game') return GAME_VOCAB.formalToCasual;
  if (domain === 'finance') return FINANCE_VOCAB.formalToCasual;
  return {};
}

// ============ Optimized Core Functions using Trie ============

function fixSpellingAndToneOptimized(text, options = {}) {
  text = normalizeNFC(text);
  const tries = buildTries();
  const whitelist = new Set((options.whitelist || []).map(w => w.toLowerCase()));
  const corrections = [];
  
  // Use array for efficient string building
  const resultParts = [];
  let i = 0;
  
  while (i < text.length) {
    const matches = tries.spellingTone.findAll(text, i);
    
    if (matches.length > 0) {
      // Pick longest match (Trie returns in order of length due to traversal)
      const bestMatch = matches.reduce((a, b) => b.length > a.length ? b : a);
      
      if (!whitelist.has(bestMatch.key.toLowerCase())) {
        resultParts.push(bestMatch.value);
        corrections.push({ 
          type: bestMatch.type, 
          from: bestMatch.key, 
          to: bestMatch.value, 
          count: 1 
        });
        i += bestMatch.length;
        continue;
      }
    }
    
    resultParts.push(text[i]);
    i++;
  }
  
  return { text: resultParts.join(''), corrections };
}

function fixSegmentationOptimized(text) {
  text = normalizeNFC(text);
  const tries = buildTries();
  const assets = getAssets();
  const corrections = [];
  
  // Check compounds using Trie
  const resultParts = [];
  let i = 0;
  
  while (i < text.length) {
    const matches = tries.segmentation.findAll(text, i);
    
    if (matches.length > 0) {
      const bestMatch = matches.reduce((a, b) => b.length > a.length ? b : a);
      const compound = bestMatch.key;
      const parts = splitCompoundWord(compound, assets);
      
      if (parts.length > 1) {
        const spaced = parts.join(' ');
        resultParts.push(spaced);
        corrections.push({ type: 'segmentation', from: compound, to: spaced });
        i += compound.length;
        continue;
      }
    }
    
    resultParts.push(text[i]);
    i++;
  }
  
  return { text: resultParts.join(''), corrections };
}

function splitCompoundWord(word, assets) {
  // Look up in segmentation dictionary to get the properly formatted value
  const dict = assets?.segmentationDict?.compound_words || {};
  const value = dict[word];
  
  if (value && value.includes(' ')) {
    return value.split(' ');
  }
  
  // Fallback: try common Vietnamese compound patterns (without diacritics)
  const patterns = [
    /^(lam)(viec|an|ngu|hoc|choi)$/,
    /^(di)(lam|hoc|choi|nhau)$/,
    /^(an)(com|sang|trua|toi|ngon)$/,
    /^(ngu)(ngon|som|muon)$/,
    /^(hoc)(tap|bai|tot)$/,
    /^(choi)(game|nhac|the thao)$/,
    /^(xem)(phim|tiep|tv)$/,
    /^(nghe)(nhac|chuyen|radio)$/,
    /^(doc)(sach|bao|code)$/,
    /^(viet)(code|bai|email)$/,
    /^(kiem)(tra|soat|duyet)$/,
    /^(xu)(ly|tri)$/,
    /^(cai)(dat|tinh)$/,
    /^(cap)(nhat|nhat)$/,
    /^(tai)(xuong|len)$/,
    /^(dang)(nhap|xuat|ky)$/,
    /^(thanh)(toan)$/,
    /^(chuyen)(khoan)$/,
    /^(nhan)(dien|vien)$/,
    /^(tu)(dong|van)$/,
    /^(khach)(hang)$/,
    /^(san)(pham)$/,
    /^(dich)(vu)$/,
    /^(ho)(tro)$/,
    /^(tu)(van)$/,
    /^(van)(chuyen)$/,
    /^(bao)(hanh)$/,
    /^(doi)(tra)$/,
    /^(lam)(bai)$/,
    /^(hoc)(bai)$/,
    /^(on)(tap)$/,
    /^(thi)(thu|thuc)$/,
    /^(xem)(diem)$/,
    /^(in)(bangdiem)$/,
    /^(lay)(bangdiem)$/,
    /^(gui)(don)$/,
    /^(nhan)(don)$/,
    /^(phe)(duyet)$/,
    /^(tu)(choi)$/,
    /^(hoan)(tra)$/,
    /^(dich)(vu)$/,
    /^(ho)(tro)$/,
    /^(tu)(van)$/,
    /^(van)(chuyen)$/,
    /^(bao)(hanh)$/,
    /^(doi)(tra)$/
  ];
  
  for (const pattern of patterns) {
    const match = word.match(pattern);
    if (match) return [match[1], match[2]];
  }
  return [word];
}

// ============ Language Mixing Detection (Optimized with Pre-compiled Patterns) ============

let mixingPatternsCache = null;

function getMixingPatterns() {
  if (mixingPatternsCache) return mixingPatternsCache;
  
  const assets = getAssets();
  const chineseChars = assets.mixingPatterns?.chinese_patterns?.single_chars || [];
  const chineseWords = assets.mixingPatterns?.chinese_patterns?.common_words || [];
  const mixedPatterns = assets.mixingPatterns?.chinese_patterns?.mixed_patterns || [];
  const englishWords = new Set((assets.mixingPatterns?.english_patterns?.meaningless_insertions || []).map(w => w.toLowerCase()));
  const techTerms = new Set((assets.mixingPatterns?.english_patterns?.tech_terms || []).map(w => w.toLowerCase()));
  
  const techPhrases = new Set([
    'go to', 'api to', 'login to', 'connect to', 'send to', 'write to', 'read from',
    'import from', 'export to', 'deploy to', 'push to', 'pull from', 'commit to',
    'merge to', 'switch to', 'checkout to', 'rebase to', 'reset to', 'build to',
    'run to', 'test to', 'lint to', 'format to', 'install to', 'update to',
    'upgrade to', 'downgrade to', 'migrate to', 'backup to', 'restore from',
    'query to', 'select from', 'insert into', 'update set', 'delete from',
    'join on', 'where', 'group by', 'order by', 'limit', 'offset'
  ]);

  mixingPatternsCache = {
    chineseChars,
    chineseWords,
    mixedPatterns,
    englishWords,
    techTerms,
    techPhrases,
    isChineseChar: (char) => char.charCodeAt(0) >= 0x4E00 && char.charCodeAt(0) <= 0x9FFF
  };
  
  return mixingPatternsCache;
}

function clearMixingPatternsCache() {
  mixingPatternsCache = null;
}

function detectMixingOptimized(text, options = {}) {
  text = normalizeNFC(text);
  const patterns = getMixingPatterns();
  const issues = [];
  const domainProtected = new Set((options.domain ? getDomainProtectedTerms(options.domain) : []).map(t => t.toLowerCase()));
  
  // Add domain protected terms to tech terms
  for (const term of domainProtected) {
    patterns.techTerms.add(term);
  }

  // Single pass through text
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isChinese = patterns.isChineseChar(char);
    
    if (isChinese) {
      issues.push({ type: 'chinese_sequence', token: char, start: i, length: 1 });
    }
    
    if (i + 1 < text.length) {
      const char2 = text[i + 1];
      const twoChar = char + char2;
      const isChinese2 = patterns.isChineseChar(char2);
      
      if (patterns.chineseWords.includes(twoChar) || (isChinese && isChinese2)) {
        issues.push({ type: 'chinese_sequence', token: twoChar, start: i, length: 2 });
      }
    }
    
    if (i + 2 < text.length) {
      const char2 = text[i + 1];
      const char3 = text[i + 2];
      const threeChar = char + char2 + char3;
      const isChinese2 = patterns.isChineseChar(char2);
      const isChinese3 = patterns.isChineseChar(char3);
      
      if (patterns.chineseWords.includes(threeChar) || (isChinese && isChinese2 && isChinese3)) {
        issues.push({ type: 'chinese_sequence', token: threeChar, start: i, length: 3 });
      }
    }
  }

  // Mixed patterns
  for (const pattern of patterns.mixedPatterns) {
    let idx = text.indexOf(pattern);
    while (idx !== -1) {
      issues.push({ type: 'mixed_pattern', token: pattern, position: idx });
      idx = text.indexOf(pattern, idx + 1);
    }
  }

  // English insertions - check words
  const words = text.split(/(\s+)/);
  let pos = 0;
  for (const word of words) {
    if (word.trim()) {
      const clean = word.toLowerCase().replace(/[.,!?;:()\[\]{}""']/g, '');
      if (patterns.englishWords.has(clean) && !patterns.techTerms.has(clean)) {
        const wordIndex = words.indexOf(word);
        let prevWord1 = '', prevWord2 = '', nextWord1 = '', nextWord2 = '';
        let count = 0;
        for (let i = wordIndex - 2; i >= 0 && count < 2; i -= 2) {
          if (words[i].trim()) {
            const w = words[i].toLowerCase().replace(/[.,!?;:()\[\]{}""']/g, '');
            if (count === 0) prevWord1 = w; else if (count === 1) prevWord2 = w; count++;
          }
        }
        count = 0;
        for (let i = wordIndex + 2; i < words.length && count < 2; i += 2) {
          if (words[i].trim()) {
            const w = words[i].toLowerCase().replace(/[.,!?;:()\[\]{}""']/g, '');
            if (count === 0) nextWord1 = w; else if (count === 1) nextWord2 = w; count++;
          }
        }
        const isTechContext = (patterns.techPhrases.has(`${prevWord1} ${clean}`) || 
          patterns.techPhrases.has(`${prevWord2} ${clean}`) || 
          patterns.techPhrases.has(`${clean} ${nextWord1}`) || 
          patterns.techPhrases.has(`${clean} ${nextWord2}`)) || patterns.techTerms.has(clean);
        if (!isTechContext) {
          issues.push({ type: 'english_insertion', token: word, position: pos });
        }
      }
      pos += word.length;
    } else {
      pos += word.length;
    }
  }

  return issues;
}

function stripMixingOptimized(text, options = {}) {
  let result = normalizeNFC(text);
  const issues = detectMixingOptimized(result, options);
  const intervals = [];
  const whitelist = new Set((options.whitelist || []).map(w => w.toLowerCase()));
  
  for (const issue of issues) {
    if (whitelist.has(issue.token.toLowerCase())) continue;
    
    if (issue.type === 'chinese_sequence') {
      intervals.push({ start: issue.start, end: issue.start + issue.length - 1 });
    } else if (issue.type === 'mixed_pattern') {
      let idx = result.indexOf(issue.token);
      while (idx !== -1) {
        intervals.push({ start: idx, end: idx + issue.token.length - 1 });
        idx = result.indexOf(issue.token, idx + 1);
      }
    } else if (issue.type === 'english_insertion') {
      const regex = new RegExp(`\\b${escapeRegExp(issue.token)}\\b`, 'g');
      let match;
      while ((match = regex.exec(result)) !== null) {
        intervals.push({ start: match.index, end: match.index + issue.token.length - 1 });
      }
    }
  }
  
  if (intervals.length === 0) return { text: result, issues };
  
  intervals.sort((a, b) => a.start - b.start);
  const merged = [];
  let current = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    const interval = intervals[i];
    if (interval.start <= current.end + 1) {
      current.end = Math.max(current.end, interval.end);
    } else {
      merged.push(current);
      current = interval;
    }
  }
  merged.push(current);
  
  let lastIndex = result.length;
  const parts = [];
  for (let i = merged.length - 1; i >= 0; i--) {
    const interval = merged[i];
    if (interval.end + 1 < lastIndex) {
      parts.push(result.substring(interval.end + 1, lastIndex));
    }
    lastIndex = interval.start;
  }
  if (lastIndex > 0) parts.push(result.substring(0, lastIndex));
  
  parts.reverse();
  result = parts.join('').replace(/\s+/g, ' ').trim();
  return { text: result, issues };
}

// ============ Context-aware Native Alternatives (P2.2 + P3.1) ============

function applyPronounMapping(text, relationship) {
  const mapping = PRONOUN_MAP[relationship] || PRONOUN_MAP.peer;
  let result = text;
  for (const [from, to] of Object.entries(mapping)) {
    result = replaceWholeWordOptimized(result, from, to);
  }
  return result;
}

function applyDomainVocabulary(text, domain) {
  const vocab = getDomainWordReplacements(domain);
  if (!vocab) return text;
  
  let result = text;
  for (const [from, to] of Object.entries(vocab)) {
    result = replaceWholeWordOptimized(result, from, to);
  }
  return result;
}

function applyDomainFormalToCasual(text, domain) {
  const mappings = getDomainFormalToCasual(domain);
  let result = text;
  for (const [formal, casuals] of Object.entries(mappings)) {
    if (result.includes(formal)) {
      result = result.replace(formal, casuals[0]);
    }
  }
  return result;
}

function getFormalLevelAdjustment(text, formality, domain) {
  if (formality === 'auto') return text;
  
  const assets = getAssets();
  const formalToCasual = assets.nativePatterns?.formal_to_casual || {};
  let result = text;
  
  if (formality === 'casual') {
    for (const [formal, casuals] of Object.entries(formalToCasual)) {
      if (result.includes(formal)) {
        result = result.replace(formal, casuals[0]);
      }
    }
    result = applyDomainFormalToCasual(result, domain);
  }
  
  if (formality === 'formal') {
    // Could add casual->formal mappings if needed
    return text;
  }
  
  return result;
}

/**
 * Get native Vietnamese alternatives with context awareness
 * @param {string} text - Input text
 * @param {Object} context - Context object
 * @param {string} context.relationship - 'peer' | 'older' | 'younger' | 'formal'
 * @param {string} context.domain - 'general' | 'tech' | 'business' | 'it' | 'lao'
 * @param {string} context.formality - 'auto' | 'formal' | 'casual'
 * @returns {Array} Ranked alternatives with fluency scores
 */
export function getNativeAlternatives(text, context = {}) {
  const { relationship = 'peer', domain = 'general', formality = 'auto' } = context;
  text = normalizeNFC(text);
  const assets = getAssets();
  const alternatives = [];

  // 1. Formal to casual mappings
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

  // 2. Word replacements
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

  // 3. Sentence structure improvements
  const passiveToActive = assets.nativePatterns?.sentence_structures?.passive_to_active || {};
  for (const [passive, active] of Object.entries(passiveToActive)) {
    if (text.includes(passive)) {
      alternatives.push({ 
        type: 'passive_to_active', 
        original: passive, 
        alternative: active 
      });
    }
  }

  const wordyToConcise = assets.nativePatterns?.sentence_structures?.wordy_to_concise || {};
  for (const [wordy, concise] of Object.entries(wordyToConcise)) {
    if (text.includes(wordy)) {
      alternatives.push({ 
        type: 'wordy_to_concise', 
        original: wordy, 
        alternative: concise 
      });
    }
  }

  // 4. Context-aware transformations
  const contextAlternatives = [];
  const pronounMapped = applyPronounMapping(text, relationship);
  if (pronounMapped !== text) {
    contextAlternatives.push({
      type: 'pronoun_mapping',
      original: text,
      alternative: pronounMapped,
      context: { relationship, rule: `pronoun_${relationship}` }
    });
  }

  const domainMapped = applyDomainVocabulary(text, domain);
  if (domainMapped !== text) {
    contextAlternatives.push({
      type: 'domain_vocabulary',
      original: text,
      alternative: domainMapped,
      context: { domain, rule: `domain_${domain}` }
    });
  }

  const formalityMapped = getFormalLevelAdjustment(text, formality, domain);
  if (formalityMapped !== text) {
    contextAlternatives.push({
      type: 'formality_adjustment',
      original: text,
      alternative: formalityMapped,
      context: { formality, domain, rule: `formality_${formality}` }
    });
  }

  const allAlternatives = [...alternatives, ...contextAlternatives];
  const candidateTexts = allAlternatives.map(alt => {
    let suggestedText = alt.alternative || alt.alternatives?.[0] || alt.context || text;
    if (alt.type === 'formal_to_casual' || alt.type === 'word_replacement') {
      suggestedText = alt.context || suggestedText;
    }
    return suggestedText;
  });

  const ranked = rankAlternatives(candidateTexts, text);
  const scoredAlternatives = allAlternatives.map((alt, idx) => {
    const rankInfo = ranked[idx] || { candidate: candidateTexts[idx], score: 0 };
    return { ...alt, fluency: rankInfo.score, suggestedText: rankInfo.candidate };
  });

  return scoredAlternatives.sort((a, b) => (b.fluency || 0) - (a.fluency || 0));
}

// Optimized whole word replacement
function replaceWholeWordOptimized(text, search, replace, whitelist = new Set()) {
  if (whitelist.has(search.toLowerCase())) return text;
  
  const searchLen = search.length;
  const searchLower = search.toLowerCase();
  let result = '';
  let lastIndex = 0;

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

// ============ Public API ============

export function fixText(text, options = {}) {
  const {
    fixSpelling = true,
    fixTone = true,
    enableSegmentation = true,
    stripMixing: doStripMixing = true,
    formalLevel = 'auto',
    whitelist = [],
    domain = 'general'
  } = options;
  
  let result = normalizeNFC(text);
  const allCorrections = [];
  let allMixingIssues = [];
  
  if (fixSpelling || fixTone) {
    const { text: fixed, corrections } = fixSpellingAndToneOptimized(result, { whitelist });
    result = fixed;
    allCorrections.push(...corrections);
  }
  
  if (enableSegmentation) {
    const { text: fixed, corrections } = fixSegmentationOptimized(result);
    result = fixed;
    allCorrections.push(...corrections);
  }
  
  if (domain !== 'general') {
    const domainMapped = applyDomainVocabulary(result, domain);
    if (domainMapped !== result) {
      allCorrections.push({ type: 'domain_vocabulary', from: result, to: domainMapped });
      result = domainMapped;
    }
  }
  
  if (doStripMixing) {
    const { text: fixed, issues } = stripMixingOptimized(result, { whitelist, domain });
    result = fixed;
    allMixingIssues.push(...issues);
  }
  
  const alternatives = getNativeAlternatives(result, { domain, formalLevel });
  
  return { original: text, fixed: result, corrections: allCorrections, mixingIssues: allMixingIssues, nativeAlternatives: alternatives };
}

export function checkText(text, options = {}) {
  text = normalizeNFC(text);
  const { text: fixed, corrections } = fixSpellingAndToneOptimized(text);
  const { text: segmented, corrections: segCorrections } = fixSegmentationOptimized(fixed);
  const issues = detectMixingOptimized(segmented, options);
  return { original: text, corrections: [...corrections, ...segCorrections], mixingIssues: issues };
}

export { fixSpellingAndToneOptimized as fixSpellingAndTone, fixSegmentationOptimized as fixSegmentation, detectMixingOptimized as detectMixing, stripMixingOptimized as stripMixing };

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
      'S3', 'EC2', 'Lambda', 'RDS', 'CloudFormation', 'CloudWatch', 'Config', 'SSM', 'KMS',
      'SecretsManager', 'EventBridge', 'SQS', 'SNS', 'API Gateway', 'Load Balancer', 'Auto Scaling',
      'CloudFront', 'Route53', 'Certificate Manager', 'WAF', 'Shield', 'GuardDuty', 'Inspector',
      'Macie', 'Security Hub', 'Artifact', 'Audit Manager', 'Control Tower', 'Organizations',
      'Service Catalog', 'Systems Manager', 'Trusted Advisor', 'Well-Architected', 'Compute Optimizer',
      'Cost Explorer', 'Budgets', 'Billing', 'Support', 'Marketplace', 'QuickSight', 'Athena',
      'Redshift', 'EMR', 'Glue', 'Data Pipeline', 'Kinesis', 'MSK', 'DynamoDB', 'ElastiCache',
      'Neptune', 'DocumentDB', 'Keyspaces', 'Timestream', 'QLDB', 'Lake Formation', 'Data Exchange',
      'Analytics', 'Machine Learning', 'SageMaker', 'Rekognition', 'Comprehend', 'Translate', 'Polly',
      'Lex', 'Connect', 'Chime', 'WorkSpaces', 'AppStream', 'WorkDocs', 'WorkMail', 'WorkLink',
      'WorkSpaces Web', 'IoT', 'Greengrass', 'FreeRTOS', 'IoT Core', 'IoT Analytics', 'IoT Events',
      'IoT SiteWise', 'IoT Things Graph', 'IoT Device Defender', 'IoT Device Management', 'Alexa',
      'Lex', 'Polly', 'Rekognition', 'Textract', 'Transcribe', 'Translate', 'Comprehend', 'Forecast',
      'Personalize', 'Fraud Detector', 'Kendra', 'CodeGuru', 'DevOps Guru', 'Proton', 'App Runner',
      'App Mesh', 'Cloud Map', 'Service Catalog', 'Systems Manager', 'OpsWorks', 'Elastic Beanstalk',
      'CloudFormation', 'CDK', 'SAM', 'Amplify', 'Device Farm', 'CodeBuild', 'CodeDeploy',
      'CodePipeline', 'CodeStar', 'CodeCommit', 'CodeArtifact', 'X-Ray', 'CloudWatch', 'CloudTrail',
      'Config', 'Systems Manager', 'Managed Services', 'Support', 'Trusted Advisor', 'Personal Health Dashboard',
      'Service Health Dashboard', 'Health', 'Well-Architected Tool', 'Compute Optimizer', 'Cost Explorer',
      'Budgets', 'Pricing Calculator', 'Billing', 'Marketplace', 'QuickSight', 'Athena', 'EMR', 'Redshift',
      'Glue', 'Data Pipeline', 'Kinesis', 'MSK', 'DynamoDB', 'ElastiCache', 'Neptune', 'DocumentDB',
      'Keyspaces', 'Timestream', 'QLDB', 'Lake Formation', 'Data Exchange', 'SageMaker', 'Rekognition',
      'Comprehend', 'Translate', 'Polly', 'Lex', 'Connect', 'Chime', 'WorkSpaces', 'AppStream',
      'WorkDocs', 'WorkMail', 'WorkLink', 'IoT', 'Greengrass', 'FreeRTOS', 'IoT Core', 'IoT Analytics',
      'IoT Events', 'IoT SiteWise', 'IoT Things Graph', 'IoT Device Defender', 'IoT Device Management'
    ],
    enableMixingDetection: true,
    formalLevel: 'auto',
    stripMixing: true,
    logLevel: 'info'
  };
  return { ...defaults, ...userConfig };
}

// Export fluency functions
export { scoreFluency, rankAlternatives };

// Export hot-reload function
export { reloadAssets };

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
    domains: {
      it: IT_VOCAB.protectedTerms.length,
      lao: Object.keys(LAO_VOCAB.phrases).length + Object.keys(LAO_VOCAB.wordMap).length,
      game: GAME_VOCAB.protectedTerms.length,
      finance: FINANCE_VOCAB.protectedTerms.length
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

// P2.3: Idiom Injection
export { findRelevantIdioms };

// P2.4: Regional Auto-detect
export { detectRegion };

// P2.5: Sentence Rewriter
export { rewriteSentence };
export { rewriteSentence as rewriteSentenceStructure };

// Initialize tries on module load
buildTries();

if (import.meta.url === `file://${process.argv[1]}`) {
  import('./cli.mjs');
}
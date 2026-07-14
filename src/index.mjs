/**
 * Vietnamese Language Support - Core Module (ESM)
 * 
 * Provides Vietnamese spelling/grammar correction, language mixing detection,
 * native fluency suggestions, idiom lookup, and regional variants.
 * 
 * P2.1: N-gram Fluency Scoring (3-gram model)
 * P2.2: Context-aware Native Alternatives (relationship, domain, formality)
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scoreFluency, rankAlternatives } from './fluency.mjs';
import { findRelevantIdioms } from './idiom.mjs';
import { detectRegion } from './region.mjs';
import { rewriteSentenceStructure as rewriteSentence } from './rewriter.mjs';
import { getAssets } from './assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../assets');
const NATIVE_PATTERNS_PATH = join(ASSETS_DIR, 'native-patterns.json');
// ============ Domain-specific Word-level Domain Vocabulary (P2.2) ============

const DOMAIN_VOCABULARY = {
  tech: {
    'cài': 'cài đặt',
    'xóa': 'xoá',
    'sửa': 'chỉnh sửa',
    'chạy': 'thực thi',
    'build': 'build',
    'deploy': 'triển khai',
    'debug': 'gỡ lỗi',
    'fix': 'sửa lỗi',
    'test': 'kiểm thử',
    'run': 'chạy',
    'start': 'khởi động',
    'stop': 'dừng',
    'restart': 'khởi động lại',
    'update': 'cập nhật',
    'upgrade': 'nâng cấp',
    'install': 'cài đặt',
    'uninstall': 'gỡ cài đặt',
    'config': 'cấu hình',
    'setting': 'cài đặt',
    'env': 'biến môi trường',
    'variable': 'biến',
    'function': 'hàm',
    'method': 'phương thức',
    'class': 'lớp',
    'object': 'đối tượng',
    'api': 'API',
    'endpoint': 'điểm cuối',
    'request': 'yêu cầu',
    'response': 'phản hồi',
    'server': 'máy chủ',
    'client': 'máy khách',
    'database': 'cơ sở dữ liệu',
    'cache': 'bộ nhớ đệm',
    'token': 'token',
    'auth': 'xác thực',
    'login': 'đăng nhập',
    'logout': 'đăng xuất',
    'register': 'đăng ký',
    'session': 'phiên',
    'cookie': 'cookie',
    'header': 'tiêu đề',
    'body': 'phần thân',
    'query': 'truy vấn',
    'param': 'tham số',
    'error': 'lỗi',
    'exception': 'ngoại lệ',
    'bug': 'lỗi',
    'issue': 'vấn đề',
    'feature': 'tính năng',
    'commit': 'commit',
    'push': 'đẩy',
    'pull': 'kéo',
    'merge': 'ghép',
    'branch': 'nhánh',
    'pr': 'pull request',
    'review': 'xem xét',
    'approve': 'phê duyệt',
    'deploy': 'triển khai',
    'release': 'phát hành',
    'version': 'phiên bản',
    'changelog': 'nhật ký thay đổi',
  },
  business: {
    'mua': 'đặt hàng',
    'bán': 'phân phối',
    'khách': 'khách hàng',
    'hàng hóa': 'sản phẩm',
    'giá': 'giá cả',
    'giảm giá': 'khuyến mãi',
    'sale': 'khuyến mãi',
    'discount': 'giảm giá',
    'order': 'đơn hàng',
    'invoice': 'hóa đơn',
    'payment': 'thanh toán',
    'receipt': 'biên lai',
    'refund': 'hoàn tiền',
    'return': 'trả hàng',
    'exchange': 'đổi hàng',
    'warranty': 'bảo hành',
    'support': 'hỗ trợ',
    'contact': 'liên hệ',
    'contract': 'hợp đồng',
    'deal': 'thỏa thuận',
    'partner': 'đối tác',
    'vendor': 'nhà cung cấp',
    'supplier': 'nhà cung cấp',
    'revenue': 'doanh thu',
    'profit': 'lợi nhuận',
    'cost': 'chi phí',
    'budget': 'ngân sách',
    'forecast': 'dự báo',
    'target': 'mục tiêu',
    'kpi': 'KPI',
    'metric': 'chỉ số',
    'report': 'báo cáo',
    'meeting': 'cuộc họp',
    'deadline': 'hạn chót',
    'schedule': 'lịch trình',
    'timeline': 'dòng thời gian',
    'milestone': 'cột mốc',
    'deliverable': 'kết quả giao',
  },
  lao: {
    // Vietnamese-Lao phrasebook mappings (from Ba's notes)
    'xin chào': 'ສະບາຍດີ (sabaidi)',
    'cảm ơn': 'ຂອບໃຈ (khob chai)',
    'xin lỗi': 'ຂໍໂທດ (kho thot)',
    'tạm biệt': 'ລາກ່າ (la ka)',
    'bạn khỏe không': 'ເຈົ້າສະບາຍດີບໍ (chao sabaidi bo)',
    'tôi hiểu': 'ຂ້ອຍເຂົ້າໃຈ (khoy khao jai)',
    'tôi không hiểu': 'ຂ້ອຍບໍ່ເຂົ້າໃຈ (khoy bo khao jai)',
    'bao nhiêu tiền': 'ທີ່ໃດ (thi dai)',
    'đắt quá': 'ແພງເກີນ (phaeng khuen)',
    'rẻ hơn được không': 'ຂໍໃຫໝົດໄດ້ບໍ (kho ham lot dai bo)',
    'nước': 'ນ້ຳ (nam)',
    'cơm': 'ເຂົ້າໜຽມ (khao niam)',
    'đi': 'ໄປ (pai)',
    'đến': 'ມາ (ma)',
    'xe': 'ລົດ (lot)',
    'xe buýt': 'ລົດເມ (lot me)',
    'sân bay': 'ສະຫນາມບິນ (sanam bin)',
    'khách sạn': 'ໂຮງແຮມ (hong haem)',
    'phòng': 'ຫ້ອງ (hong)',
    'ngủ': 'ນອນ (non)',
    'ăn': 'ກິນ (kin)',
    'uống': 'ດື່ມ (duem)',
    'đẹp': 'ງາມ (ngam)',
    'xấu': 'ບໍ່ງາມ (bo ngam)',
    'to': 'ໃຫຍ່ (nyai)',
    'nhỏ': 'ເນື້ອຍ (nuea)',
    'nóng': 'ຮ້ອນ (hon)',
    'lạnh': 'ເຢັນ (yen)',
  }
};

// ============ Pronoun Mapping by Relationship (P2.2) ============

const PRONOUN_MAP = {
  peer: {
    'tôi': 'mình',
    'bạn': 'bạn',
    'anh': 'anh',
    'chị': 'chị',
    'em': 'em',
    'tao': 'mình',
    'tui': 'mình',
  },
  older: {
    'tôi': 'em',
    'bạn': 'anh/chị',
    'anh': 'anh',
    'chị': 'chị',
    'em': 'em',
    'tao': 'em',
    'tui': 'em',
  },
  younger: {
    'tôi': 'anh/chị',
    'bạn': 'em',
    'anh': 'anh',
    'chị': 'chị',
    'em': 'em',
    'tao': 'anh/chị',
    'tui': 'anh/chị',
  },
  formal: {
    'tôi': 'tôi',
    'bạn': 'bạn',
    'anh': 'anh',
    'chị': 'chị',
    'em': 'em',
    'tao': 'tôi',
    'tui': 'tôi',
  },
};

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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const techPhrases = new Set([
    'go to', 'api to', 'login to', 'connect to', 'send to', 'write to', 'read from',
    'import from', 'export to', 'deploy to', 'push to', 'pull from', 'commit to',
    'merge to', 'switch to', 'checkout to', 'rebase to', 'reset to', 'build to',
    'run to', 'test to', 'lint to', 'format to', 'install to', 'update to',
    'upgrade to', 'downgrade to', 'migrate to', 'backup to', 'restore from',
    'query to', 'select from', 'insert into', 'update set', 'delete from',
    'join on', 'where', 'group by', 'order by', 'limit', 'offset'
  ]);

  const isChineseChar = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x4E00 && code <= 0x9FFF;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isChinese = isChineseChar(char);
    if (isChinese) {
      issues.push({ type: 'chinese_sequence', token: char, start: i, length: 1 });
    }
    if (i + 1 < text.length) {
      const char2 = text[i + 1];
      const twoChar = char + char2;
      if (chineseWords.includes(twoChar) || (isChinese && isChineseChar(char2))) {
        issues.push({ type: 'chinese_sequence', token: twoChar, start: i, length: 2 });
      }
    }
    if (i + 2 < text.length) {
      const char2 = text[i + 1];
      const char3 = text[i + 2];
      const threeChar = char + char2 + char3;
      if (chineseWords.includes(threeChar) || (isChinese && isChineseChar(char2) && isChineseChar(char3))) {
        issues.push({ type: 'chinese_sequence', token: threeChar, start: i, length: 3 });
      }
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
      const clean = word.toLowerCase().replace(/[.,!?;:()\[\]{}""']/g, '');
      if (englishWords.includes(clean) && !techTerms.has(clean)) {
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
        const isTechContext = (techPhrases.has(`${prevWord1} ${clean}`) || techPhrases.has(`${prevWord2} ${clean}`) || techPhrases.has(`${clean} ${nextWord1}`) || techPhrases.has(`${clean} ${nextWord2}`)) || techTerms.has(clean);
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

function stripMixing(text, whitelist = []) {
  let result = normalizeNFC(text);
  const issues = detectMixing(result);
  const intervals = [];
  for (const issue of issues) {
    if (whitelist.length > 0 && whitelist.some(w => w.toLowerCase() === issue.token.toLowerCase())) {
      continue;
    }
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
  let parts = [];
  for (let i = merged.length - 1; i >= 0; i--) {
    const interval = merged[i];
    if (interval.end + 1 < lastIndex) {
      parts.push(result.substring(interval.end + 1, lastIndex));
    }
    lastIndex = interval.start;
  }
  if (lastIndex > 0) {
    parts.push(result.substring(0, lastIndex));
  }
  parts.reverse();
  result = parts.join('').replace(/\s+/g, ' ').trim();
  return { text: result, issues };
}

// ============ Context-aware Native Alternatives (P2.2) ============

function applyPronounMapping(text, relationship) {
  const mapping = PRONOUN_MAP[relationship] || PRONOUN_MAP.peer;
  let result = text;
  for (const [from, to] of Object.entries(mapping)) {
    result = replaceWholeWord(result, from, to);
  }
  return result;
}

function applyDomainVocabulary(text, domain) {
  const vocab = DOMAIN_VOCABULARY[domain];
  if (!vocab) return text;
  
  let result = text;
  for (const [from, to] of Object.entries(vocab)) {
    result = replaceWholeWord(result, from, to);
  }
  return result;
}

function getFormalLevelAdjustment(text, formality) {
  if (formality === 'auto') return text;
  
  const assets = getAssets();
  const formalToCasual = assets.nativePatterns?.formal_to_casual || {};
  
  if (formality === 'casual') {
    // Apply formal->casual mappings
    let result = text;
    for (const [formal, casuals] of Object.entries(formalToCasual)) {
      if (result.includes(formal)) {
        result = result.replace(formal, casuals[0]);
      }
    }
    return result;
  }
  
  if (formality === 'formal') {
    // Reverse: casual -> formal (if we have mappings)
    // For now, keep as-is
    return text;
  }
  
  return text;
}

/**
 * Get native Vietnamese alternatives with context awareness
 * @param {string} text - Input text
 * @param {Object} context - Context object
 * @param {string} context.relationship - 'peer' | 'older' | 'younger' | 'formal'
 * @param {string} context.domain - 'general' | 'tech' | 'business' | 'lao'
 * @param {string} context.formality - 'auto' | 'formal' | 'casual'
 * @returns {Array} Ranked alternatives with fluency scores
 */
export function getNativeAlternatives(text, context = {}) {
  const {
    relationship = 'peer',
    domain = 'general',
    formality = 'auto'
  } = context;

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

  // 2. Word replacements (slang/tech synonyms)
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

  // Pronoun mapping based on relationship
  const pronounMapped = applyPronounMapping(text, relationship);
  if (pronounMapped !== text) {
    contextAlternatives.push({
      type: 'pronoun_mapping',
      original: text,
      alternative: pronounMapped,
      context: { relationship, rule: `pronoun_${relationship}` }
    });
  }

  // Domain-specific vocabulary
  const domainMapped = applyDomainVocabulary(text, domain);
  if (domainMapped !== text) {
    contextAlternatives.push({
      type: 'domain_vocabulary',
      original: text,
      alternative: domainMapped,
      context: { domain, rule: `domain_${domain}` }
    });
  }

  // Formality adjustment
  const formalityMapped = getFormalLevelAdjustment(text, formality);
  if (formalityMapped !== text) {
    contextAlternatives.push({
      type: 'formality_adjustment',
      original: text,
      alternative: formalityMapped,
      context: { formality, rule: `formality_${formality}` }
    });
  }

  // Combine all alternatives
  const allAlternatives = [...alternatives, ...contextAlternatives];

  // 5. Rank by fluency (P2.1)
  // For each alternative, create the full suggested text and score it
  const candidateTexts = allAlternatives.map(alt => {
    // Generate the suggested text
    let suggestedText = alt.alternative || alt.alternatives?.[0] || alt.context || text;
    if (alt.type === 'formal_to_casual' || alt.type === 'word_replacement') {
      suggestedText = alt.context || suggestedText;
    }
    return suggestedText;
  });

  // Rank using fluency model
  const ranked = rankAlternatives(candidateTexts, text);

  // Attach fluency scores to alternatives
  const scoredAlternatives = allAlternatives.map((alt, idx) => {
    const rankInfo = ranked[idx] || { candidate: candidateTexts[idx], score: 0 };
    return {
      ...alt,
      fluency: rankInfo.score,
      suggestedText: rankInfo.candidate
    };
  });

  // Sort by fluency descending
  return scoredAlternatives.sort((a, b) => (b.fluency || 0) - (a.fluency || 0));
}

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
  return { original: text, fixed: result, corrections: allCorrections, mixingIssues: allMixingIssues, nativeAlternatives: alternatives };
}

export function checkText(text) {
  text = normalizeNFC(text);
  const { text: fixed, corrections } = fixSpellingAndTone(text);
  const { text: segmented, corrections: segCorrections } = fixSegmentation(fixed);
  const issues = detectMixing(segmented);
  return { original: text, corrections: [...corrections, ...segCorrections], mixingIssues: issues };
}

export { fixSpellingAndTone, fixSegmentation, detectMixing, stripMixing };

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

// Export fluency functions
export { scoreFluency, rankAlternatives };

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

// P2.3: Idiom Injection
export { findRelevantIdioms };

// P2.4: Regional Auto-detect
export { detectRegion };

// P2.5: Sentence Rewriter
export { rewriteSentence };

if (import.meta.url === `file://${process.argv[1]}`) {
  import('./cli.mjs');
}
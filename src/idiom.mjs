/**
 * P2.3: Idiom/Proverb Injection
 * Find relevant idioms based on text context
 */

import { getAssets } from './assets.mjs';

function extractKeywords(text) {
  // Simple keyword extraction: nouns, verbs, adjectives
  const stopwords = new Set([
    'tôi', 'mình', 'em', 'anh', 'chị', 'bạn', 'họ', 'chúng', 'các', 'những',
    'là', 'của', 'và', 'hoặc', 'nhưng', 'mà', 'vì', 'nên', 'nếu', 'thì', 'còn',
    'trong', 'ngoài', 'trên', 'dưới', 'trước', 'sau', 'giữa', 'bên', 'cạnh',
    'đi', 'đến', 'về', 'ra', 'vào', 'lên', 'xuống', 'qua', 'lại',
    'rất', 'quá', 'hơi', 'khá', 'tương đối', 'hoàn toàn', 'tuyệt đối',
    'đã', 'đang', 'sắp', 'vừa', 'mới', 'sẽ', 'sẽ', 'có', 'không', 'được',
    'cho', 'với', 'tại', 'từ', 'đến', 'về', 'theo', 'như', 'giống', 'khác'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[.,!?;:()\[\]{}""']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.has(w));
  
  return [...new Set(words)];
}

function scoreIdiom(idiom, keywords, context = {}) {
  const searchText = `${idiom.phrase} ${idiom.meaning} ${idiom.english} ${idiom.category} ${idiom.usage || ''}`.toLowerCase();
  let score = 0;
  
  // Keyword overlap
  for (const kw of keywords) {
    if (searchText.includes(kw)) score += 2;
  }
  
  // Category match
  if (context.category && idiom.category === context.category) score += 5;
  if (context.intent && idiom.usage && idiom.usage.toLowerCase().includes(context.intent.toLowerCase())) score += 5;
  if (context.domain) {
    const domainCategories = {
      'business': ['persistence', 'success', 'effort', 'patience'],
      'tech': ['learning', 'precision', 'problem_solving'],
      'encouraging': ['persistence', 'effort', 'patience'],
      'advice': ['wisdom', 'caution', 'humility'],
      'relationship': ['harmony', 'forgiveness', 'gratitude']
    };
    if (domainCategories[context.domain]?.includes(idiom.category)) score += 3;
  }
  
  // Tone match
  if (context.tone) {
    const toneCategories = {
      'encouraging': ['persistence', 'effort', 'patience', 'success'],
      'serious': ['wisdom', 'caution', 'consequence'],
      'friendly': ['harmony', 'gratitude', 'friendship']
    };
    if (toneCategories[context.tone]?.includes(idiom.category)) score += 2;
  }
  
  return score;
}

export function findRelevantIdioms(text, context = {}) {
  const assets = getAssets();
  const keywords = extractKeywords(text);
  const idioms = assets.idioms?.idioms || [];
  const proverbs = assets.idioms?.proverbs || [];
  
  const allIdioms = [
    ...idioms.map(i => ({...i, type: 'idiom'})),
    ...proverbs.map(p => ({...p, type: 'proverb', category: p.category || 'proverb'}))
  ];
  
  const scored = allIdioms
    .map(idiom => ({
      ...idiom,
      relevance: scoreIdiom(idiom, keywords, context),
      fluencyBoost: 0.1 // placeholder for P2.1 integration
    }))
    .filter(i => i.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
  
  return scored;
}

export function getIdiomSuggestion(text, context = {}) {
  const idioms = findRelevantIdioms(text, context);
  if (idioms.length === 0) return null;
  
  const best = idioms[0];
  return {
    phrase: best.phrase,
    meaning: best.meaning,
    english: best.english,
    category: best.category,
    usage: best.usage,
    type: best.type,
    relevance: best.relevance
  };
}
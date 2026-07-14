/**
 * P2.5: Sentence Structure Rewriter
 * Passive -> Active, Wordy -> Concise, Topic-Comment restructuring
 */

import { getAssets } from './assets.mjs';

function rewritePassiveToActive(text) {
  const assets = getAssets();
  const patterns = assets.nativePatterns?.sentence_structures?.passive_to_active || {};
  
  let result = text;
  const changes = [];
  
  for (const [passive, active] of Object.entries(patterns)) {
    if (result.includes(passive)) {
      result = result.replace(new RegExp(passive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), active);
      changes.push({ type: 'passive_to_active', from: passive, to: active });
    }
  }
  
  return { text: result, changes };
}

function rewriteWordyToConcise(text) {
  const assets = getAssets();
  const patterns = assets.nativePatterns?.sentence_structures?.wordy_to_concise || {};
  
  let result = text;
  const changes = [];
  
  // Sort by length descending to match longer phrases first
  const sorted = Object.entries(patterns).sort((a, b) => b[0].length - a[0].length);
  
  for (const [wordy, concise] of sorted) {
    const regex = new RegExp(wordy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, concise);
      changes.push({ type: 'wordy_to_concise', from: wordy, to: concise });
    }
  }
  
  return { text: result, changes };
}

function rewriteDoubleNegative(text) {
  const assets = getAssets();
  const patterns = assets.nativePatterns?.sentence_structures?.double_negative || {};
  
  let result = text;
  const changes = [];
  
  for (const [doubleNeg, replacement] of Object.entries(patterns)) {
    if (result.includes(doubleNeg)) {
      result = result.replace(new RegExp(doubleNeg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      changes.push({ type: 'double_negative', from: doubleNeg, to: replacement || '(removed)' });
    }
  }
  
  return { text: result, changes };
}

function rewriteTopicComment(text) {
  // Vietnamese topic-comment structure: Topic + Comment
  // "Cái áo này, tôi mua hôm qua" -> "Tôi mua cái áo này hôm qua" (more natural)
  // For now, basic patterns
  
  let result = text;
  const changes = [];
  
  // Pattern: "Noun phrase, Subject Verb" -> "Subject Verb Noun phrase"
  // e.g., "Quả táo này, em ăn" -> "Em ăn quả táo này"
  const topicCommentPattern = /^([^,]{3,30}),\s*([^,]+)$/;
  const match = result.match(topicCommentPattern);
  if (match) {
    const topic = match[1].trim();
    const comment = match[2].trim();
    // Check if comment starts with pronoun/name (subject)
    if (/^(tôi|mình|em|anh|chị|bác|chú|cô|bạn|họ|chúng tôi|chúng mình)\b/i.test(comment)) {
      const newText = `${comment} ${topic}`;
      if (newText !== result) {
        result = newText;
        changes.push({ type: 'topic_comment', from: `${topic}, ${comment}`, to: newText });
      }
    }
  }
  
  return { text: result, changes };
}

function rewriteFronting(text) {
  // Move time/place adverbials to front for emphasis
  // "Tôi đi làm hôm qua" -> "Hôm qua tôi đi làm"
  // This is stylistic, keep optional
  
  let result = text;
  const changes = [];
  
  // Time fronting: "Subject Verb time" -> "time Subject Verb"
  const timePattern = /^(tôi|mình|em|anh|chị|bạn|họ|chúng tôi|chúng mình)\s+(.+?)\s+(hôm qua|hôm nay|ngày mai|ngày xưa|ngày nào|tuần trước|tuần này|tuần sau|tháng trước|tháng này|tháng sau|năm ngoái|năm nay|năm sau|sáng nay|trưa nay|chiều nay|tối nay|ngay bây giờ|vừa rồi|vừa xong)$/i;
  const match = result.match(timePattern);
  if (match) {
    const subject = match[1];
    const verbPhrase = match[2];
    const time = match[3];
    const newText = `${time} ${subject} ${verbPhrase}`;
    if (newText !== result) {
      result = newText;
      changes.push({ type: 'time_fronting', from: result, to: newText });
    }
  }
  
  return { text: result, changes };
}

export function rewriteSentenceStructure(text, options = {}) {
  const {
    passiveToActive = true,
    wordyToConcise = true,
    topicComment = true,
    timeFronting = false,
    doubleNegative = true
  } = options;
  
  let result = text;
  const allChanges = [];
  
  if (doubleNegative) {
    const { text: t, changes } = rewriteDoubleNegative(result);
    result = t;
    allChanges.push(...changes);
  }
  
  if (passiveToActive) {
    const { text: t, changes } = rewritePassiveToActive(result);
    result = t;
    allChanges.push(...changes);
  }
  
  if (wordyToConcise) {
    const { text: t, changes } = rewriteWordyToConcise(result);
    result = t;
    allChanges.push(...changes);
  }
  
  if (topicComment) {
    const { text: t, changes } = rewriteTopicComment(result);
    result = t;
    allChanges.push(...changes);
  }
  
  if (timeFronting) {
    const { text: t, changes } = rewriteFronting(result);
    result = t;
    allChanges.push(...changes);
  }
  
  return { text: result, changes: allChanges };
}
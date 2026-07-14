/**
 * OpenClaw Hook: post_model_output
 * Auto-fixes Vietnamese output from any model
 */

import { fixText, loadConfig } from '../../dist/index.mjs';

/**
 * @param {Object} context
 * @param {string} context.text - Model output text
 * @param {string} [context.agentId] - Agent identifier
 * @param {string} [context.model] - Model identifier
 * @param {Object} [context.metadata] - Additional metadata
 * @param {string} [context.metadata.formalLevel] - 'auto' | 'formal' | 'casual'
 * @param {Object} [context.metadata.vnLangConfig] - VN lang config override
 * @param {Object} [context.logger] - Logger with info/debug/warn/error methods
 * @returns {Promise<{text: string, metadata: Object}>}
 */
export default async function postModelOutput(context) {
  const { text, agentId, model, metadata = {}, logger } = context;

  if (!text || typeof text !== 'string') {
    return { text, metadata: { vnLangApplied: false, corrections: [], mixingDetected: [] } };
  }

  // Quick Vietnamese detection heuristic
  const hasVietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/.test(text);
  const hasVietnameseWords = /\b(tôi|bạn|anh|chị|em|mình|họ|chúng|các|những|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|là|có|không|được|sẽ|đã|đang|sắp|vừa|mới|và|hoặc|nhưng|mà|vì|nên|nếu|thì|còn|cái|trong|ngoài|trên|dưới|trước|sau|giữa|bên|cạnh|đi|đến|về|ra|vào|lên|xuống|qua|lại|ở|ăn|uống|ngủ|thức|nghỉ|làm|học|chơi|xem|nghe|nói|đọc|viết|hiểu|biết|thích|yêu|ghét|sợ|buồn|vui|giận|đau|khỏe|yếu|mạnh|nhanh|chậm|tốt|xấu|đẹp|đắt|rẻ|lớn|nhỏ|cao|thấp|dài|ngắn|rộng|hẹp|dày|mỏng|nặng|nhẹ|nóng|lạnh|ấm|mát)\b/i.test(text);

  if (!hasVietnameseChars && !hasVietnameseWords) {
    logger?.debug?.('vn-lang: skipped non-Vietnamese text', { agentId, model, length: text.length });
    return { text, metadata: { vnLangApplied: false, corrections: [], mixingDetected: [] } };
  }

  // Load config from metadata or use defaults
  const config = loadConfig(metadata?.vnLangConfig);

  // Apply fix
  const result = fixText(text, {
    fixSpelling: true,
    fixTone: true,
    fixSegmentation: true,
    stripMixing: config.stripMixing !== false,
    formalLevel: metadata?.formalLevel ?? config.formalLevel ?? 'auto'
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
---
name: vietnamese-language-support
description: Vietnamese dictionary & grammar helper for weak-Vietnamese models: spelling/grammar correction, native fluency patterns, language-mixing detection
version: 1.0.0
author: Min
license: MIT
homepage: https://github.com/openclaw/vietnamese-language-support
metadata:
  tags: [vietnamese, nlp, language-model, post-processing, grammar]
  languages: [vi]
  claude:
    emoji: "🇻🇳"
---

# Vietnamese Language Support Skill

## Purpose
Help weak-Vietnamese models (Nemotron, Gemma, etc.) produce natural, grammatically correct Vietnamese without language mixing (random Chinese/English tokens).

## Installation
```bash
cd ~/.openclaw/plugin-skills/vietnamese-language-support
npm install  # if package.json exists, else just use scripts directly
```

## Quick Start
```bash
# Fix a Vietnamese sentence
./scripts/vn-lang fix "Model的 này hơi yếu tiếng Việt的"

# Check for language mixing
./scripts/vn-lang check "Tôi think rằng này okay"

# Get native alternative
./scripts/vn-lang native "Tôi nghĩ là"
```

## Tools Provided

### `vn-lang fix <text>`
Correct spelling, grammar, tone marks, word segmentation, and strip language mixing.
Returns corrected text.

### `vn-lang check <text>`
Analyze text for issues. Returns JSON:
```json
{
  "original": "input text",
  "issues": [
    {"type": "mixing", "tokens": ["的", "了"], "positions": [6, 12]},
    {"type": "spelling", "word": "ko", "suggestion": "không"},
    {"type": "tone", "word": "dang", "suggestion": "đang"}
  ],
  "cleaned": "corrected text"
}
```

### `vn-lang native <phrase>`
Get native-sounding alternatives for formal/weak phrasing.
Returns JSON array of alternatives.

### `vn-lang idiom <keyword>`
Search Vietnamese idioms/proverbs (tục ngữ, thành ngữ) by keyword.

## Dictionary Assets
- `assets/spelling-dict.json` — Common misspellings → corrections
- `assets/tone-dict.json` — Unaccented → accented forms
- `assets/segmentation.json` — Compound words that need spaces
- `assets/native-patterns.json` — Weak phrasing → native alternatives
- `assets/mixing-patterns.json` — Regex patterns for Chinese/English mixing detection
- `assets/idioms.json` — 200+ Vietnamese idioms with meanings
- `assets/regional-variants.json` — North/Central/South word variants

## Integration with OpenClaw

### As Post-Processing Hook (recommended)
Add to your agent config:
```json
{
  "hooks": {
    "post_model_output": "vietnamese-language-support/scripts/vn-lang fix"
  }
}
```

### As Tool in Session
```bash
# In any session, call:
vn-lang fix "câu cần sửa"
```

### In AGENTS.md
Add rule:
> **Vietnamese Output Rule:** Mọi output tiếng Việt phải qua `vn-lang fix` trước khi gửi cho Ba.

## CLI Usage
```bash
# Fix
vn-lang fix "Text cần sửa"

# Check only (no auto-fix)
vn-lang check "Text cần kiểm tra"

# Native alternatives
vn-lang native "Tôi nghĩ là"

# Idiom lookup
vn-lang idiom "kiên trì"

# Regional variant
vn-lang region "bây giờ" south
```

## Python API (for embedding)
```python
from vietnamese_language_support import VietnameseProcessor

proc = VietnameseProcessor()
result = proc.fix("Model的 này hơi yếu tiếng Việt的")
# result.text, result.corrections, result.mixing_detected
```

## Adding Custom Rules
Edit JSON files in `assets/` — no code changes needed. Reload with:
```bash
vn-lang reload
```

## License
MIT — Free to use, modify, distribute.
# Vietnamese Language Support

A comprehensive Vietnamese language processing skill for OpenClaw that provides spelling/grammar correction, language mixing detection, native fluency suggestions, idiom lookup, regional variants, and domain specialization.

## Features

### Core Corrections (P0-P1)
- **Spelling Correction**: Fixes common Vietnamese spelling errors (e.g., "Day" → "Đây", "la" → "là")
- **Tone Mark Restoration**: Adds missing diacritics (e.g., "Toi" → "Tôi", "rat" → "rất")
- **Word Segmentation**: Splits compound words correctly (e.g., "lamviec" → "làm việc")
- **NFC Normalization**: Ensures consistent Unicode normalization

### Language Mixing Detection (P1)
- **Chinese Character Detection**: Identifies and removes Chinese characters inserted in Vietnamese text
- **English Insertion Detection**: Detects meaningless English words mixed in Vietnamese sentences
- **Tech Term Preservation**: Whitelists technical terms (API, React, TypeScript, etc.) to prevent false positives
- **Context-Aware Filtering**: Understands tech context to avoid stripping legitimate English terms

### Native Fluency (P2)
- **Formal ↔ Casual Conversion**: "Tôi nghĩ là" → "Mình nghĩ"
- **Word Replacements**: Slang/colloquial alternatives for formal words
- **Sentence Structure Improvement**: Passive → Active, Wordy → Concise
- **Context-Aware Alternatives**: Relationship-based pronouns, domain-specific vocabulary, formality levels
- **3-gram Fluency Scoring**: Ranks alternatives using a trained n-gram language model

### Idiom & Proverb Injection (P2.3)
- **Keyword-Based Search**: Find relevant idioms by keyword
- **Context-Aware Ranking**: Filters by category, domain, tone, intent
- **500+ Idioms/Proverbs**: Curated collection with meanings and usage examples

### Regional Variants (P2.4)
- **Auto-Detection**: Identifies Northern/Central/Southern dialect from text
- **Variant Lookup**: Get regional equivalents for words/phrases
- **Confidence Scoring**: Returns detection confidence and matched markers

### Sentence Rewriter (P2.5)
- **Passive → Active Voice**: "Bài này được viết bởi tôi" → "Tôi viết bài này"
- **Wordy → Concise**: "Tôi có ý định là muốn đi" → "Tôi muốn đi"
- **Double Negative Removal**: "Không phải là không có" → "Có"
- **Topic-Comment Restructuring**: "Quả táo này, em ăn" → "Em ăn quả táo này"
- **Time Fronting**: "Tôi đi làm hôm qua" → "Hôm qua tôi đi làm"

### Domain Specialization (P3)
- **IT/Dev**: Technical vocabulary, CLI commands, deployment terms
- **Game**: Gaming terminology, MMO terms
- **Finance**: Business/e-commerce vocabulary
- **Lao Language Context**: Vietnamese-Lao phrasebook for travelers

### Performance & Observability (P4)
- **Benchmark Suite**: 1000 test sentences, P95 < 5ms, memory delta < 50MB
- **Health Check**: Asset counts, domain stats, uptime
- **Prometheus Metrics**: avgLatencyMs, p95LatencyMs, memoryUsageMB, correctionRate, mixingDetectedRate
- **Hot Reload**: File watcher for asset changes in development

## Installation

```bash
# As OpenClaw skill
openclaw skill install vietnamese-language-support

# Or as npm package
npm install vietnamese-language-support
```

## Quick Start

### CLI Usage

```bash
# Fix Vietnamese text
vn-lang fix "Model的 này hơi yếu tiếng Việt的"
# Output: Fixed: "Model này hơi yếu tiếng Việt"

# Check for issues without fixing
vn-lang check "Tôi think rằng này okay"

# Get native alternatives
vn-lang native "Tôi nghĩ là"
vn-lang native "Tôi cần deploy feature" --domain it

# Search idioms
vn-lang idiom "kiên trì"

# Get regional variant
vn-lang region "now" south
```

### Programmatic Usage

```javascript
import { fixText, checkText, getNativeAlternatives, searchIdioms, getRegionalVariant, detectRegion, rewriteSentenceStructure } from 'vietnamese-language-support';

// Fix text with all corrections
const result = fixText('Model的 này hơi yếu tiếng Việt的', {
  domain: 'general',
  formalLevel: 'auto',
  whitelist: ['API', 'React']
});

console.log(result.fixed);           // "Model này hơi yếu tiếng Việt"
console.log(result.corrections);     // [{ type: 'mixed_pattern', ... }]
console.log(result.mixingIssues);    // [{ type: 'chinese_sequence', token: '的' }]
console.log(result.nativeAlternatives); // [{ type: 'formal_to_casual', ... }]

// Check only (no auto-fix)
const check = checkText('Tôi think rằng này okay');
console.log(check.mixingIssues);     // english_insertion: think, okay

// Native alternatives with context
const alternatives = getNativeAlternatives('Tôi nghĩ là nên làm', {
  relationship: 'older',  // peer | older | younger | formal
  domain: 'it',           // general | it | game | finance | lao
  formality: 'casual'     // auto | formal | casual
});

// Idiom search
const idioms = searchIdioms('kiên trì', {
  category: 'persistence',
  domain: 'business',
  tone: 'encouraging'
});

// Regional variant
const variant = getRegionalVariant('now', 'south'); // "bây h"

// Auto-detect region
const region = detectRegion('Ăn cơm chưa bạn ơi, ngon quá ship đi');
// { region: 'south', confidence: 0.85, markers: ['ăn cơm chưa', 'bạn ơi', 'ngon quá', 'ship đi'] }

// Rewrite sentence structure
const rewritten = rewriteSentenceStructure('Bài này được viết bởi tôi', {
  passiveToActive: true,
  wordyToConcise: true,
  topicComment: true,
  timeFronting: false,
  doubleNegative: true
});
// { text: 'Tôi viết bài này', changes: [...] }
```

## Configuration

```javascript
import { loadConfig } from 'vietnamese-language-support';

const config = loadConfig({
  dictPath: 'assets',
  whitelist: ['MyBrand', 'CustomTerm'],
  enableMixingDetection: true,
  formalLevel: 'auto',      // 'auto' | 'formal' | 'casual'
  stripMixing: true,
  logLevel: 'info'          // 'debug' | 'info' | 'warn' | 'error'
});
```

## OpenClaw Integration

### Skill Registration

The skill registers automatically with OpenClaw when placed in the plugin skills directory.

### Tools Available

| Tool | Description | Schema |
|------|-------------|--------|
| `vn_fix` | Fix spelling, tone, segmentation, strip mixing | `vn_fix.schema.json` |
| `vn_check` | Check for issues without auto-fixing | `vn_check.schema.json` |
| `vn_native` | Get native-sounding alternatives | `vn_native.schema.json` |
| `vn_idiom` | Search idioms/proverbs by keyword | `vn_idiom.schema.json` |
| `vn_region` | Get regional variant for word | `vn_region.schema.json` |

### Hook: post_model_output

Automatically processes model output to correct Vietnamese text:

```javascript
// In OpenClaw config
hooks: {
  post_model_output: 'hooks/post_model_output.mjs'
}
```

### Health Check

```bash
# Via CLI
vn-lang health

# Via HTTP (if exposed)
curl http://localhost:18789/health/vietnamese-language-support
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-07-14T10:30:00.000Z",
  "assetsLoaded": {
    "spellingDict": 117,
    "toneDict": 327,
    "segmentationDict": 718,
    "nativePatterns": { "formalToCasual": 26, "wordReplacements": 146 },
    "mixingPatterns": { "chineseChars": 450, "englishInsertions": 89, "techTerms": 156 },
    "idioms": 482,
    "regionalVariants": 3
  },
  "domains": { "it": 45, "lao": 52, "game": 38, "finance": 41 },
  "uptime": 3600.5,
  "metrics": {
    "avgLatencyMs": 0.83,
    "p95LatencyMs": 1.71,
    "memoryUsageMB": 12.5,
    "correctionRate": 18.2,
    "mixingDetectedRate": 4.4
  }
}
```

### Prometheus Metrics

```bash
curl http://localhost:18789/metrics/vietnamese-language-support
```

Output:
```
# HELP vn_lang_avg_latency_ms Average latency in milliseconds
# TYPE vn_lang_avg_latency_ms gauge
vn_lang_avg_latency_ms 0.83
# HELP vn_lang_p95_latency_ms P95 latency in milliseconds
# TYPE vn_lang_p95_latency_ms gauge
vn_lang_p95_latency_ms 1.71
# HELP vn_lang_memory_usage_mb Memory usage in MB
# TYPE vn_lang_memory_usage_mb gauge
vn_lang_memory_usage_mb 12.5
# HELP vn_lang_correction_rate Correction rate percentage
# TYPE vn_lang_correction_rate gauge
vn_lang_correction_rate 18.2
# HELP vn_lang_mixing_detected_rate Mixing detected rate percentage
# TYPE vn_lang_mixing_detected_rate gauge
vn_lang_mixing_detected_rate 4.4
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test              # Run vitest tests
npm run test:watch    # Watch mode
```

### Benchmarking

```bash
npm run benchmark     # Run 1000-sentence benchmark
# Or with CPU profiling
node --cpu-prof src/benchmark.mjs
```

### Hot Reload (Development)

```bash
# Set NODE_ENV=development to enable file watching
NODE_ENV=development node your-script.mjs
```

Asset changes will trigger automatic reload.

## Asset Files

| File | Description | Entries |
|------|-------------|---------|
| `spelling-dict.json` | Spelling corrections | 117 |
| `tone-dict.json` | Tone mark corrections | 327 |
| `segmentation-dict.json` | Compound word splits | 718 |
| `native-patterns.json` | Formal→casual, word replacements, sentence structures | 200+ |
| `mixing-patterns.json` | Chinese/English mixing patterns | 695+ |
| `idioms.json` | Idioms and proverbs | 482 |
| `regional-variants.json` | North/Central/South vocabulary | 3 regions |
| `fluency-model.json` | 3-gram language model | 3007 n-grams |

## Domain Vocabularies

### IT/Dev (45 protected terms, 38 word replacements)
- CLI commands: `cài` → `cài đặt`, `xóa` → `xoá`, `deploy` → `triển khai`
- Technical terms preserved: `API`, `React`, `TypeScript`, `Docker`, `Kubernetes`, etc.

### Game (38 protected terms)
- Gaming terms: `lag`, `fps`, `ping`, `guild`, `raid`, `boss`, `nerf`, `buff`

### Finance (41 protected terms)
- Business terms: `order` → `đơn hàng`, `payment` → `thanh toán`, `invoice` → `hóa đơn`

### Lao Language (52 phrases/words)
- Phrasebook: `xin chào` → `ສະບາຍດີ (sabaidi)`, `cảm ơn` → `ຂອບໃຈ (khob chai)`

## Architecture

```
src/
├── index.mjs           # Main entry point, exports all public APIs
├── cli.mjs             # CLI command handler
├── assets.mjs          # Asset loader with hot-reload (P4.4)
├── fluency.mjs         # 3-gram fluency model (P2.1)
├── idiom.mjs           # Idiom injection (P2.3)
├── region.mjs          # Regional auto-detect (P2.4)
├── rewriter.mjs        # Sentence rewriter (P2.5)
├── health.mjs          # Health check with metrics (P4.3)
├── benchmark.mjs       # Performance benchmark (P4.1)
├── domains/
│   ├── it.mjs          # IT/Dev domain
│   ├── game.mjs        # Game domain
│   ├── finance.mjs     # Finance domain
│   └── lao.mjs         # Lao language context
```

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| fixText P95 latency | < 5ms | ~1.7ms |
| Memory delta (1000 calls) | < 50MB | ~10MB |
| Throughput | > 1000/sec | ~1200/sec |

Run benchmark: `npm run benchmark`

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Run `npm test` and `npm run benchmark`
5. Submit PR

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Credits

- Built for OpenClaw ecosystem
- Vietnamese language data curated from multiple sources
- 3-gram fluency model trained on clean Vietnamese corpus
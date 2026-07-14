# Vietnamese Language Support - API Documentation

Complete API reference for `vietnamese-language-support` v1.0.0

## Installation

```bash
# OpenClaw skill
openclaw skill install github:hackerpro108/Vietnamese-Language-Support-Skill

# NPM package
npm install vietnamese-language-support
```

## Core Functions

### `fixText(text, options?)`

Main function to fix Vietnamese text with all corrections.

**Parameters:**
- `text` (string): Input Vietnamese text
- `options` (FixTextOptions): Processing options

**Returns:** `Promise<FixTextResult>`

```typescript
interface FixTextOptions {
  fixSpelling?: boolean;        // default: true
  fixTone?: boolean;            // default: true
  enableSegmentation?: boolean; // default: true
  stripMixing?: boolean;        // default: true
  formalLevel?: 'auto' | 'formal' | 'casual'; // default: 'auto'
  whitelist?: string[];         // default: []
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance'; // default: 'general'
}
```

**Example:**
```javascript
import { fixText } from 'vietnamese-language-support';

const result = fixText('Model的 này hơi yếu tiếng Việt的', {
  domain: 'tech',
  whitelist: ['API', 'React']
});

console.log(result.fixed);
// "Model này hơi yếu tiếng Việt"

console.log(result.corrections);
// [
//   { type: 'mixed_pattern', from: '的', to: '' },
//   { type: 'mixed_pattern', from: '的', to: '' }
// ]

console.log(result.mixingIssues);
// [
//   { type: 'chinese_sequence', token: '的', start: 5, length: 1 },
//   { type: 'chinese_sequence', token: '的', start: 28, length: 1 }
// ]

console.log(result.nativeAlternatives);
// [
//   { type: 'formal_to_casual', original: 'này', alternative: 'cái này', fluency: 0.92 },
//   { type: 'domain_vocabulary', original: 'tiếng Việt', alternative: 'tiếng Việt chuẩn', fluency: 0.88 }
// ]
```

---

### `checkText(text, options?)`

Check for issues without auto-fixing.

**Parameters:**
- `text` (string): Input Vietnamese text
- `options` (CheckTextOptions): Check options

**Returns:** `CheckTextResult`

```typescript
interface CheckTextOptions {
  whitelist?: string[];
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance';
}
```

**Example:**
```javascript
import { checkText } from 'vietnamese-language-support';

const check = checkText('Tôi think rằng này okay');
console.log(check.mixingIssues);
// [
//   { type: 'english_insertion', token: 'think', start: 4, length: 5 },
//   { type: 'english_insertion', token: 'okay', start: 13, length: 4 }
// ]
```

---

### `getNativeAlternatives(text, options?)`

Get native-sounding alternatives with context awareness.

**Parameters:**
- `text` (string): Input phrase
- `options` (NativeAlternativesOptions): Context options

**Returns:** `NativeAlternative[]`

```typescript
interface NativeAlternativesOptions {
  relationship?: 'peer' | 'older' | 'younger' | 'formal';
  domain?: 'general' | 'tech' | 'business' | 'lao' | 'it' | 'game' | 'finance';
  formality?: 'auto' | 'formal' | 'casual';
}
```

**Example:**
```javascript
import { getNativeAlternatives } from 'vietnamese-language-support';

// Speaking to older person
const alt1 = getNativeAlternatives('Tôi nghĩ là nên làm', { relationship: 'older' });
// Returns: [{ type: 'pronoun_mapping', original: 'Tôi', alternative: 'em', fluency: 0.95 }, ...]

// Tech domain
const alt2 = getNativeAlternatives('cài đặt phần mềm', { domain: 'tech' });
// Returns: [{ type: 'domain_vocabulary', alternative: 'cài đặt phần mềm', fluency: 0.92 }, ...]

// Casual formality
const alt3 = getNativeAlternatives('Tôi nghĩ là nên làm', { formality: 'casual' });
// Returns: [{ type: 'formality_adjustment', alternative: 'Mình nghĩ là nên làm', fluency: 0.94 }, ...]
```

---

### `searchIdioms(keyword, options?)`

Search Vietnamese idioms/proverbs by keyword with context filtering.

**Parameters:**
- `keyword` (string): Search keyword
- `options` (IdiomSearchOptions): Filter options

**Returns:** `IdiomEntry[]`

```typescript
interface IdiomSearchOptions {
  category?: string;
  domain?: 'general' | 'tech' | 'business' | 'lao';
  tone?: 'encouraging' | 'cautionary' | 'descriptive' | 'humorous' | 'philosophical';
  intent?: 'encourage' | 'warn' | 'describe' | 'express' | 'advise';
}
```

```typescript
interface IdiomEntry {
  phrase: string;
  meaning: string;
  english?: string;
  category: string;
  usage?: string;
  fluencyBoost?: number;
  relevance?: number;
}
```

**Example:**
```javascript
import { searchIdioms } from 'vietnamese-language-support';

const idioms = searchIdioms('kiên trì', { category: 'persistence', intent: 'encourage' });
// Returns:
// [
//   {
//     phrase: 'có công mài sắt, có ngày thành kim',
//     meaning: 'Kiêng trì làm việc sẽ đạt kết quả',
//     english: 'Perseverance leads to success',
//     category: 'persistence',
//     usage: 'Khuyến khích ai đó đang nỗ lực',
//     relevance: 8
//   },
//   ...
// ]
```

---

### `getRegionalVariant(word, region)`

Get regional variant (North/Central/South) for a word.

**Parameters:**
- `word` (string): Word to look up
- `region` ('north' | 'central' | 'south'): Target region

**Returns:** `string` - Regional variant or original word

**Example:**
```javascript
import { getRegionalVariant } from 'vietnamese-language-support';

getRegionalVariant('now', 'south');    // 'bây h'
getRegionalVariant('ngon', 'north');   // 'ngon' (same)
getRegionalVariant('đi', 'central');   // 'đi' (same)
```

---

### `detectRegion(text)`

Auto-detect region from Vietnamese text.

**Parameters:**
- `text` (string): Input text

**Returns:** `RegionDetectionResult`

```typescript
interface RegionDetectionResult {
  region: 'north' | 'central' | 'south';
  confidence: number;
  scores: { north: number; central: number; south: number };
  markers: string[];
}
```

**Example:**
```javascript
import { detectRegion } from 'vietnamese-language-support';

detectRegion('Ăn cơm chưa bạn ơi, ngon quá ship đi');
// Returns:
// {
//   region: 'south',
//   confidence: 0.85,
//   scores: { north: 0.12, central: 0.18, south: 0.85 },
//   markers: ['ăn cơm chưa', 'bạn ơi', 'ngon quá', 'ship đi']
// }
```

---

### `rewriteSentenceStructure(text, options?)`

Rewrite sentence structure for better flow.

**Parameters:**
- `text` (string): Input sentence
- `options` (RewriteOptions): Transformation options

**Returns:** `RewriteResult`

```typescript
interface RewriteOptions {
  passiveToActive?: boolean;    // default: true
  wordyToConcise?: boolean;     // default: true
  doubleNegative?: boolean;     // default: true
  topicComment?: boolean;       // default: true
  timeFronting?: boolean;       // default: false
}
```

```typescript
interface RewriteResult {
  text: string;
  changes: Array<{
    type: 'passive_to_active' | 'wordy_to_concise' | 'double_negative' | 'topic_comment' | 'time_fronting';
    original: string;
    rewritten: string;
  }>;
}
```

**Example:**
```javascript
import { rewriteSentenceStructure } from 'vietnamese-language-support';

const result = rewriteSentenceStructure('Bài này được viết bởi tôi', {
  passiveToActive: true
});
// Returns:
// {
//   text: 'Tôi viết bài này',
//   changes: [{ type: 'passive_to_active', original: 'được viết bởi tôi', rewritten: 'tôi viết' }]
// }
```

---

### `scoreFluency(text)`

Score fluency of Vietnamese text (0-1).

**Parameters:**
- `text` (string): Input text

**Returns:** `FluencyScoreResult`

```typescript
interface FluencyScoreResult {
  score: number;
  tokens: string[];
}
```

**Example:**
```javascript
import { scoreFluency } from 'vietnamese-language-support';

scoreFluency('Tôi nghĩ là nên làm việc này');
// { score: 0.91, tokens: ['tôi', 'nghĩ', 'là', 'nên', 'làm', 'việc', 'này'] }

scoreFluency('Tôi think là nên làm');
// { score: 0.26, tokens: ['tôi', 'think', 'là', 'nên', 'làm'] }
```

---

### `rankAlternatives(candidates, context?)`

Rank alternative texts by fluency.

**Parameters:**
- `candidates` (string[]): Array of candidate texts
- `context` (string, optional): Context text for scoring

**Returns:** `RankedAlternative[]`

```typescript
interface RankedAlternative {
  candidate: string;
  score: number;
}
```

---

### `loadConfig(userConfig?)`

Load skill configuration with defaults.

**Parameters:**
- `userConfig` (LoadConfigOptions, optional): User-provided config overrides

**Returns:** `Config`

```typescript
interface LoadConfigOptions {
  dictPath?: string;
  whitelist?: string[];
  enableMixingDetection?: boolean;
  formalLevel?: 'auto' | 'formal' | 'casual';
  stripMixing?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

---

### `healthCheck()`

Health check endpoint for monitoring.

**Returns:** `Promise<HealthCheckResult>`

```typescript
interface HealthCheckResult {
  status: 'healthy' | 'degraded';
  version: string;
  timestamp: string;
  assetsLoaded: { ... };
  domains: { ... };
  uptime: number;
  metrics: {
    avgLatencyMs: number;
    p95LatencyMs: number;
    memoryUsageMB: number;
    correctionRate: number;
    mixingDetectedRate: number;
  };
}
```

**Example:**
```javascript
import { healthCheck } from 'vietnamese-language-support';

const health = await healthCheck();
console.log(health.status); // 'healthy'
console.log(health.metrics.p95LatencyMs); // 1.54
```

---

## OpenClaw Integration

### Hook: `post_model_output`

Auto-processes every model response:

```javascript
// In openclaw.json
{
  "hooks": {
    "post_model_output": "hooks/post_model_output.js"
  }
}
```

The hook receives model output text and returns corrected text.

### Tools (5 tools with JSON schemas)

| Tool | Description | Schema |
|------|-------------|--------|
| `vn_fix` | Fix spelling, tone, segmentation, strip mixing | `tools/vn_fix.schema.json` |
| `vn_check` | Check for issues without auto-fixing | `tools/vn_check.schema.json` |
| `vn_native` | Get native alternatives with context | `tools/vn_native.schema.json` |
| `vn_idiom` | Search idioms/proverbs by keyword | `tools/vn_idiom.schema.json` |
| `vn_region` | Get regional variant for word | `tools/vn_region.schema.json` |

---

## CLI Usage

```bash
# Fix text
vn-lang fix "Model的 này hơi yếu"

# Check only
vn-lang check "Tôi think rằng này okay"

# Native alternatives
vn-lang native "Tôi nghĩ là" --relationship older
vn-lang native "cài đặt" --domain tech

# Search idioms
vn-lang idiom "kiên trì"

# Regional variant
vn-lang region "now" south

# Health check
vn-lang health

# Watch mode (hot reload)
vn-lang watch ./assets
```

---

## Domain Specialization

### IT/Dev (`domain: 'tech'` or `'it'`)
- 127 protected terms, 38 word replacements
- Sources: GitHub VN issues, StackOverflow VN, VionSky codebase
- Terms: React, Next.js, Prisma, WebSocket, JWT, CI/CD, Docker, Kubernetes, etc.

### Game/Tycoon (`domain: 'game'`)
- 140 terms, 52 replacements
- Thiên Tài Kinh Doanh mechanics: fish, farm, stock, business, crypto tiers

### Finance/Crypto (`domain: 'finance'`)
- 111 terms, 41 replacements
- TradFi + DeFi + VN stock market (VN-Index, HOSE, HNX)

### Lao Context (`domain: 'lao'`)
- 67 terms, 52 phrases
- Worker comms: greetings, wages, safety, food, transport, health

---

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| `fixText` P95 latency | < 5ms | **1.54ms** |
| Memory delta (1000 calls) | < 50MB | **3.17MB** |
| Throughput | > 1000/sec | **~1200/sec** |
| Worst-case (concat words) | < 10ms | **2.3ms** |
| Test coverage | - | **57 tests passing** |

---

## TypeScript

Full TypeScript definitions included:

```typescript
import { 
  fixText, 
  FixTextOptions, 
  FixTextResult,
  getNativeAlternatives,
  NativeAlternativesOptions
} from 'vietnamese-language-support';
```

Types are available at `dist/index.d.ts` and exported via package.json `"types"` field.

---

## License

MIT License - see [LICENSE](LICENSE) for details.
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-14

### Added
- **Core Corrections (P0-P1)**
  - Spelling correction: 117 chat abbreviations (`ko`→`không`, `dc`→`được`, `vs`→`với`, `j`→`gì`)
  - Tone mark restoration: 327 homophone mappings (`Toi`→`Tôi`, `rat`→`rất`, `lam`→`làm`)
  - Word segmentation: 718 compound word splits (`lamviec`→`làm việc`, `caidat`→`cài đặt`)
  - NFC normalization at all entry points
  - Unicode CJK Range (U+4E00-U+9FFF) Chinese character detection (single/bi/tri-gram)
  - English filler detection: 431 meaningless words with ±2 word context window
  - Tech whitelist: 300+ protected terms (API, React, TypeScript, Docker, Kubernetes, etc.)

- **Native Fluency & Intelligence (P2)**
  - 3-gram Fluency Model: 3,007 n-grams, 765 vocab, add-k smoothing (k=0.1)
  - Context-aware alternatives: 4 dimensions (relationship, domain, formality, regional)
  - Idiom/Proverb injection: 482 entries with keyword+category+context scoring
  - Regional auto-detection: North/Central/South with confidence scoring
  - Sentence rewriter: passive→active, wordy→concise, double-negative, topic-comment

- **Domain Specialization (P3)**
  - IT/Dev: 127 protected terms, 38 replacements (GitHub VN issues, StackOverflow VN, VionSky codebase)
  - Game/Tycoon: 140 terms, 52 replacements (Thiên Tài Kinh Doanh mechanics)
  - Finance/Crypto: 111 terms, 41 replacements (TradFi + DeFi + VN stock market)
  - Lao Context: 67 terms, 52 phrases (worker comms from Ba-notes & Ya's messages)

- **Performance & Observability (P4)**
  - Benchmark suite: 1000 sentences, fixText P95=1.54ms (<5ms target), Memory Δ=10MB (<50MB)
  - 57 unit tests (Vitest) covering all P0-P3 functionality
  - Health check endpoint with asset counts, domain stats, uptime
  - Prometheus metrics: avgLatencyMs, p95LatencyMs, memoryUsageMB, correctionRate, mixingDetectedRate
  - Hot-reload assets via chokidar (dev mode)

- **Production Ready (P5)**
  - OpenClaw skill manifest (skill.json) with 5 tools and post_model_output hook
  - ESM/CommonJS dual exports with TypeScript definitions
  - CLI: `vn-lang fix|check|native|idiom|region|health|watch`
  - Trie-based O(m) lookup for all dictionaries
  - Worst-case concat words benchmark: 2.3ms (`lamviecquanh`→`làm việc quanh`)

### Fixed
- Variable shadowing in `fixText`: renamed option `fixSegmentation` → `enableSegmentation`
- TypeScript interfaces stripped from `.mjs` files
- Hook import path corrected to `../../dist/index.mjs`
- Unicode NFC normalization added at all public entry points
- Duplicate exports removed from `index.mjs`
- `splitCompoundWord` now uses dictionary values for splitting
- `src/health.mjs` imports fixed for dist compatibility

### Changed
- Chinese detection: migrated from limited dictionary (94 chars) to full Unicode CJK Range
- English filler: added context window protection for tech phrases (`go to`, `deploy to`, `login to`, `api to`, `push to`, `connect to`)
- `package.json` repository URL corrected to `hackerpro108/Vietnamese-Language-Support-Skill`

### Security
- Whitelist protection prevents over-correction (e.g., `KO technique` stays `KO`, not `không technique`)

## [0.9.0] - 2026-07-14 (Pre-release)

### Added
- P0-P4 implementation complete
- Internal testing and benchmarking

## [0.1.0] - 2026-07-13 (Initial Prototype

### Added
- Standalone CLI `vn-lang` with basic spelling/tone/segmentation
- Initial asset dictionaries
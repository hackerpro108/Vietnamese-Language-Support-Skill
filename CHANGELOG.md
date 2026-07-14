# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-14

### Added - P0: Foundation
- Core module structure with ESM support
- Asset loading system (`assets.mjs`)
- Spelling dictionary (117 entries)
- Tone mark dictionary (327 entries)
- Segmentation dictionary (718 compound words)
- Basic `fixText()`, `checkText()` functions
- NFC normalization
- Whitelist support for protected terms

### Added - P1: Language Mixing Detection
- Chinese character detection (single chars, words, sequences)
- English insertion detection with context-aware filtering
- Mixed pattern detection (Chinese-Vietnamese mixed words)
- Tech term whitelist preservation (API, React, TypeScript, etc.)
- `stripMixing()` function to remove detected mixing
- OpenClaw hook: `post_model_output`

### Added - P2: Native Fluency & Intelligence
- **P2.1**: 3-gram fluency scoring model (3007 n-grams, vocab 765)
- **P2.2**: Context-aware native alternatives
  - Relationship-based pronoun mapping (peer/older/younger/formal)
  - Domain-specific vocabulary (tech, business, Lao)
  - Formality level adjustment (auto/formal/casual)
  - Fluency-ranked alternatives
- **P2.3**: Idiom/proverb injection (500+ entries)
  - Keyword-based search
  - Context filtering (category, domain, tone, intent)
  - Relevance scoring
- **P2.4**: Regional variant auto-detection
  - North/Central/South dialect detection
  - Confidence scoring
  - Marker extraction
  - Regional vocabulary lookup
- **P2.5**: Sentence structure rewriter
  - Passive → Active voice
  - Wordy → Concise
  - Double negative removal
  - Topic-comment restructuring
  - Time fronting

### Added - P3: Domain Specialization
- **P3.1**: IT/Dev domain corpus
  - Technical vocabulary mappings
  - Protected terms
  - Formal→casual mappings
- **P3.2**: Lao language context
  - Vietnamese-Lao phrasebook
  - Word-level mappings
- **P3.3**: Game domain corpus
- **P3.4**: Finance domain corpus

### Added - P4: Performance & Operations
- **P4.1**: Benchmark suite (`src/benchmark.mjs`)
  - 1000 Vietnamese test sentences
  - Target: <5ms P95, <50MB memory delta
  - CPU profiling support (`node --cpu-prof`)
- **P4.2**: Comprehensive unit tests (67 tests)
  - Spelling, tone, segmentation, mixing, fluency, idioms, regions
  - Domain specialization tests
  - Performance regression tests
  - Vitest framework
- **P4.3**: Enhanced health check with metrics
  - `avgLatencyMs`, `p95LatencyMs`, `memoryUsageMB`
  - `correctionRate`, `mixingDetectedRate`
  - Prometheus `/metrics` endpoint format
- **P4.4**: Hot-reload assets
  - `reloadAssets()` function
  - Optional chokidar file watcher for development
- **P4.5**: OpenClaw plugin manifest (`plugin.json`)

### Added - P5: Final Polish & Package
- **P5.1**: Complete documentation (`README.md`)
  - Installation, usage, configuration
  - CLI and programmatic examples
  - Domain specialization guide
  - OpenClaw integration
  - Performance benchmarks
- **P5.2**: Version history (`CHANGELOG.md`)
- **P5.3**: MIT License
- **P5.4**: Package configuration
  - ESM/CommonJS dual exports
  - CLI binary entry point
  - Proper `files` array for publishing
- **P5.5**: OpenClaw integration verified
  - Hook: `post_model_output`
  - Tools: `vn_fix`, `vn_check`, `vn_native`, `vn_idiom`, `vn_region`
  - Health endpoint
- **P5.6**: Final build and test verification

## [Unreleased]

### Planned
- WebAssembly acceleration for fluency scoring
- Additional dialect support (North Central, Northwest)
- Transformer-based fluency model option
- REST API server mode
- Browser bundle for client-side usage
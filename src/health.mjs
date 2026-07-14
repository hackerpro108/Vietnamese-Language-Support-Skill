/**
 * Health Check Endpoint for vietnamese-language-support skill
 * P4.3: Extended with performance metrics
 */

import { getAssets } from './assets.mjs';
import { healthCheck as coreHealthCheck } from './index.mjs';

// In-memory metrics storage (in production, use Prometheus client)
let metrics = {
  requestCount: 0,
  totalLatencyMs: 0,
  latencies: [],
  correctionsCount: 0,
  mixingDetectedCount: 0,
  textsProcessed: 0,
  startTime: Date.now()
};

const MAX_LATENCY_SAMPLES = 1000;

export function recordMetric(latencyMs, corrections, mixingIssues) {
  metrics.requestCount++;
  metrics.totalLatencyMs += latencyMs;
  metrics.correctionsCount += corrections;
  metrics.mixingDetectedCount += mixingIssues;
  metrics.textsProcessed++;
  
  metrics.latencies.push(latencyMs);
  if (metrics.latencies.length > MAX_LATENCY_SAMPLES) {
    metrics.latencies.shift();
  }
}

export function getMetrics() {
  const sortedLatencies = [...metrics.latencies].sort((a, b) => a - b);
  const avgLatency = metrics.requestCount > 0 ? metrics.totalLatencyMs / metrics.requestCount : 0;
  const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0;
  const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] || 0;
  const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0;
  
  const memUsage = process.memoryUsage();
  
  return {
    avgLatencyMs: Math.round(avgLatency * 100) / 100,
    p50LatencyMs: Math.round(p50 * 100) / 100,
    p95LatencyMs: Math.round(p95 * 100) / 100,
    p99LatencyMs: Math.round(p99 * 100) / 100,
    memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
    memoryUsageRSSMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
    correctionRate: metrics.textsProcessed > 0 ? 
      Math.round(metrics.correctionsCount / metrics.textsProcessed * 10000) / 100 : 0,
    mixingDetectedRate: metrics.textsProcessed > 0 ? 
      Math.round(metrics.mixingDetectedCount / metrics.textsProcessed * 10000) / 100 : 0,
    uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
    totalRequests: metrics.requestCount
  };
}

export async function healthCheck() {
  const assets = getAssets();
  const coreHealth = await coreHealthCheck();
  const perfMetrics = getMetrics();
  
  return {
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
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
    domains: coreHealth.domains,
    uptime: process.uptime(),
    // P4.3: Performance metrics
    metrics: perfMetrics
  };
}

// Prometheus metrics endpoint format
export function getPrometheusMetrics() {
  const m = getMetrics();
  const lines = [
    '# HELP vn_lang_avg_latency_ms Average latency in milliseconds',
    '# TYPE vn_lang_avg_latency_ms gauge',
    `vn_lang_avg_latency_ms ${m.avgLatencyMs}`,
    '# HELP vn_lang_p95_latency_ms P95 latency in milliseconds',
    '# TYPE vn_lang_p95_latency_ms gauge',
    `vn_lang_p95_latency_ms ${m.p95LatencyMs}`,
    '# HELP vn_lang_memory_usage_mb Memory usage in MB',
    '# TYPE vn_lang_memory_usage_mb gauge',
    `vn_lang_memory_usage_mb ${m.memoryUsageMB}`,
    '# HELP vn_lang_correction_rate Correction rate percentage',
    '# TYPE vn_lang_correction_rate gauge',
    `vn_lang_correction_rate ${m.correctionRate}`,
    '# HELP vn_lang_mixing_detected_rate Mixing detected rate percentage',
    '# TYPE vn_lang_mixing_detected_rate gauge',
    `vn_lang_mixing_detected_rate ${m.mixingDetectedRate}`,
    '# HELP vn_lang_uptime_seconds Uptime in seconds',
    '# TYPE vn_lang_uptime_seconds counter',
    `vn_lang_uptime_seconds ${m.uptimeSeconds}`,
    '# HELP vn_lang_total_requests Total requests processed',
    '# TYPE vn_lang_total_requests counter',
    `vn_lang_total_requests ${m.totalRequests}`
  ];
  
  return lines.join('\n') + '\n';
}

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === 'healthy' ? 0 : 1);
  }).catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
}
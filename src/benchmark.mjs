/**
 * Vietnamese Language Support - Benchmark Script (P4.1)
 * 
 * Tests fixText() on 1000 typical VN sentences
 * Target: <5ms per call (p95), <50MB memory
 * Run with: node --cpu-prof src/benchmark.mjs
 */

import { fixText, checkText, getNativeAlternatives, searchIdioms, getRegionalVariant } from './index.mjs';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// 1000 typical Vietnamese sentences for benchmarking
const VIETNAMESE_SENTENCES = [
  // Common greetings and daily conversations
  "Xin chào bạn khỏe không",
  "Cảm ơn bạn rất nhiều",
  "Xin lỗi làm phiền bạn",
  "Tôi hiểu ý bạn rồi",
  "Mình nghĩ cũng thế",
  "Bạn có đồng ý không",
  "Không có vấn đề gì",
  "Hôm nay trời đẹp quá",
  "Ăn cơm chưa bạn ơi",
  "Chúc bạn ngày tốt lành",
  "Tạm biệt hẹn gặp lại",
  "Chúc ngủ ngon nhé",
  "Dạo này bạn thế nào",
  "Công việc thế nào rồi",
  "Học tập có vất vả không",
  "Giúp mình với nhé",
  "Xin phép được hỏi",
  "Mình không hiểu lắm",
  "Bạn giải thích giùm",
  "Cảm ơn sự giúp đỡ",
  
  // Work and tech related
  "Server đang chạy bình thường",
  "API đã deploy thành công",
  "Code đã build xong",
  "Bug đã fix xong",
  "Test đã pass hết",
  "Deploy thành công",
  "Build thất bại",
  "Restart service đi",
  "Update config nhé",
  "Check log đi",
  "Debug code này",
  "Database đang chạy",
  "Cache cần clear",
  "Service đã restart",
  "Config đã update",
  "Log đã check",
  "Code đã debug",
  "Test đã chạy",
  "Build đã pass",
  "Deploy lên production",
  
  // Business/e-commerce
  "Khách hàng mua hàng",
  "Khách hàng đặt hàng",
  "Khách hàng thanh toán",
  "Đơn hàng thành công",
  "Hóa đơn đã thanh toán",
  "Sản phẩm tốt",
  "Giá cả hợp lý",
  "Phân phối nhanh",
  "Hỗ trợ tốt",
  "Đối tác tin tưởng",
  "Hợp đồng đã ký",
  "Thanh toán thành công",
  "Giao hàng nhanh",
  "Khách hàng hài lòng",
  "Doanh thu tăng",
  "Lợi nhuận tốt",
  "Chi phí giảm",
  "Ngân sách đủ",
  "Dự báo đúng",
  "Mục tiêu đạt",
  
  // Common Vietnamese with tone/spelling issues (for testing corrections)
  "Model này hơi yếu tiếng Việt",
  "Tôi think rằng này okay",
  "Code này chạy được không",
  "Server bị down rồi",
  "API trả về error",
  "Database connect không được",
  "Config sai rồi",
  "Env variable thiếu",
  "Token hết hạn rồi",
  "Login không được",
  "Logout không được",
  "Register bị lỗi",
  "Session mất rồi",
  "Cookie bị clear",
  "Header thiếu token",
  "Body request sai",
  "Query param thiếu",
  "Param không hợp lệ",
  "Error handling thiếu",
  "Exception không catch",
  "Bug này khó fix",
  "Issue này critical",
  "Feature này urgent",
  "Commit message sai",
  "Push force lên main",
  "Pull request tạo",
  "Merge conflict nhiều",
  "Branch không merge",
  "Review code kỹ",
  "Approve pull request",
  "Deploy lên staging",
  "Release version mới",
  "Changelog cập nhật",
  "Version bump lên",
  
  // Sentences with Vietnamese spelling/tone issues
  "Day la cau tieng Viet khong dau",
  "Toi thay no rat tot",
  "Ban co muon an khong",
  "Hom nay troi dep qua",
  "Cam on ban nhieu",
  "Xin loi lam phien",
  "Toi hieu y ban",
  "Min nghĩ cung the",
  "Ban dong y khong",
  "Khong co van de",
  "An com chua ban",
  "Chuc ban ngay tot",
  "Tam biet hen gap lai",
  "Chuc ngu ngon",
  "Dao nay ban the nao",
  "Cong viec the nao",
  "Hoc tap vat va khong",
  "Giup minh voi",
  "Xin phep duoc hoi",
  "Min khong hieu lam",
  "Ban giai thich giup",
  "Cam on su giup do",
  
  // Language mixing patterns (Chinese/English insertions)
  "Model的 này hơi yếu tiếng Việt的",
  "Tôi think rằng này okay",
  "Code này run được không",
  "Server down rồi",
  "API return error",
  "Database connect fail",
  "Config sai rồi",
  "Env variable missing",
  "Token expired rồi",
  "Login fail",
  "Logout fail",
  "Register error",
  "Session lost",
  "Cookie cleared",
  "Header missing token",
  "Body request wrong",
  "Query param missing",
  "Param invalid",
  "Error handling missing",
  "Exception not caught",
  "Bug này hard to fix",
  "Issue này critical",
  "Feature này urgent",
  "Commit message wrong",
  "Force push lên main",
  "Pull request create",
  "Merge conflict nhiều",
  "Branch không merge được",
  "Review code kỹ",
  "Approve pull request",
  "Deploy lên staging",
  "Release version mới",
  "Changelog update",
  "Version bump lên",
  
  // Regional variants (North/Central/South)
  "Bây giờ anh đi đâu",
  "Hôm nay em ăn gì",
  "Ăn cơm chưa bạn ơi",
  "Không biết không hiểu",
  "Bình thường thôi",
  "Đi đâu về đâu",
  "Làm gì ăn gì",
  "Xe ôm xe bus",
  "Tàu hỏa máy bay",
  "Phố ngõ ngõ ngách",
  "Cửa hàng chợ siêu thị",
  "Bún chả phở bánh cuốn",
  "Chả cá bún riêu bún thang",
  "Trà đá cà phê trứng",
  "Bia hơi nhậu quán hàng",
  "Đẹp trai xinh gái",
  "Dễ thương ngầu chất",
  "Ngon ngon lành",
  "Mệt khỏe ốm đau",
  "Bệnh thuốc bác sĩ bệnh viện",
  
  "Hôm nay bây h răng",
  "Mô chi ri rứa ráng",
  "Mời mời mơi mỡ mỡ màng",
  "Chiều tối sáng trưa",
  "Ngày ngày mai ngày kia",
  "Ăn cơm ăn bữa",
  "Ăn trưa ăn chiều ăn tối ăn sáng",
  "Đi đâu đi mô đi răng",
  "Về mô về răng",
  "Mời ăn mời uống mời vào mời ngồi",
  "Bún bò bún bò Huế",
  "Bánh bèo bánh nậm bánh lọc bánh ít",
  "Cơm hến bún hến cháo hến",
  "Nem lụi nem chua",
  "Trà đá nước mía",
  "Cà phê sữa đá bia rượu",
  "Ngon ngon lắm ngon răng ngon mô",
  "Dở dở lắm dở mô",
  "Đẹp đẹp lắm đẹp răng",
  "Xấu xấu lắm xấu răng",
  
  "Bây giờ bây h hiện tại",
  "Ngay bây giờ hôm nay",
  "Ăn cơm ăn bữa",
  "Ăn trưa ăn chiều ăn tối ăn sáng",
  "Đi làm về nhà",
  "Nghỉ ngơi ngủ ngon ngủ sớm ngủ muộn",
  "Xế xế ông xế bà xế anh xế chị xế em",
  "Mình tớ cậu mày tao tui mik",
  "Không ko k hok hông hệ hệ gì hệ chi",
  "Biết bik bt hiểu hok hiểu ko hiểu",
  "Sao tại sao vì sao tại sạo sao đó sao này",
  "Đâu đâu rồi đi đâu ở đâu tại đâu",
  "Gì gì đó gì này chi chi chi gì chi",
  "Được đc ok oke oki được rồi ok rồi",
  "Cảm ơn cám ơn ck thank thanks tks",
  "Xin lỗi sorry sry lỗi lỗi rồi",
  "Bún mắm hủ tiếu bánh xèo bánh khọt bánh căn bánh bột lọc",
  "Cơm tấm cơm niêu cơm gà cơm sườn cơm chiên cơm rang",
  "Trà đá trà sữa cà phê sữa đá cà phê đen đá nước ép sinh tố",
  "Bia bia hơi bia lon rượu nhậu quán nhậu quán trà đá",
  "Ngon ngon lắm ngon quá ngon vl ngon vcl ngon cmn",
  "Dở dở lắm dở quá dở vl dở vcl dở cmn",
  "Đẹp đẹp lắm đẹp quá đẹp trai đẹp gái xinh xinh lắm xinh quá",
  "Mệt mệt lắm mệt quá khỏe khỏe lắm khỏe quá",
  "Ốm ốm lắm ốm quá đau đau lắm đau quá",
  "Tiền tiền nào tiền đâu giá giá nào giá bao nhiêu",
  "Mua mua gì mua đâu bán bán gì bán đâu",
  "Shop store online ship cod chuyển khoản momo zalopay",
  
  // Tech domain Vietnamese
  "Server restart xong",
  "Service running bình thường",
  "API response nhanh",
  "Database query tối ưu",
  "Cache hit rate cao",
  "Frontend build pass",
  "Backend deploy thành công",
  "CI/CD pipeline chạy",
  "Docker container healthy",
  "Kubernetes pod ready",
  "Monitoring alert ok",
  "Logging đầy đủ",
  "Tracing enabled",
  "Security scan pass",
  "Performance test pass",
  "Load test ok",
  "Stress test ok",
  "Chaos engineering done",
  "Backup restore test",
  "Disaster recovery ready",
  
  // Business domain Vietnamese
  "Khách hàng đặt hàng thành công",
  "Đơn hàng đang giao",
  "Thanh toán qua MoMo",
  "ZaloPay thanh toán",
  "Chuyển khoản ngân hàng",
  "Hóa đơn điện tử",
  "Biên lai thanh toán",
  "Hoàn tiền thành công",
  "Trả hàng đổi hàng",
  "Bảo hành sản phẩm",
  "Hỗ trợ khách hàng",
  "Tư vấn sản phẩm",
  "Khiếu nại khách hàng",
  "Đánh giá sản phẩm",
  "Review 5 sao",
  "Feedback tích cực",
  "Khách hàng quay lại",
  "Chăm sóc khách hàng",
  "Chương trình khách hàng thân thiết",
  "Voucher giảm giá",
  "Flash sale hôm nay",
  
  // More Vietnamese sentences for benchmark volume
  "Tôi đang học lập trình",
  "Em đang làm bài tập",
  "Anh đang viết code",
  "Chị đang review code",
  "Bạn đang debug bug",
  "Họ đang deploy app",
  "Chúng tôi đang meeting",
  "Chúng mình đang code",
  "Server đang khởi động",
  "Database đang backup",
  "API đang respond",
  "Frontend đang render",
  "Backend đang process",
  "Worker đang queue",
  "Scheduler đang run",
  "Cron job đã chạy",
  "Backup đã xong",
  "Restore đã test",
  "Migration đã chạy",
  "Seed data đã xong",
];

// Expand to 1000 sentences by variations
function expandSentences(baseSentences, targetCount) {
  const variations = [
    // Add pronouns variations
    (s) => s.replace('Tôi', 'Mình'),
    (s) => s.replace('Tôi', 'Em'),
    (s) => s.replace('Tôi', 'Anh'),
    (s) => s.replace('Tôi', 'Chị'),
    (s) => s.replace('Tôi', 'Bạn'),
    (s) => s.replace('tôi', 'mình'),
    (s) => s.replace('tôi', 'em'),
    (s) => s.replace('tôi', 'anh'),
    (s) => s.replace('tôi', 'chị'),
    (s) => s.replace('tôi', 'bạn'),
    // Add time variations
    (s) => s.replace('Hôm nay', 'Ngày mai'),
    (s) => s.replace('Hôm nay', 'Hôm qua'),
    (s) => s.replace('Hôm nay', 'Tuần này'),
    (s) => s.replace('hôm nay', 'ngày mai'),
    (s) => s.replace('hôm nay', 'hôm qua'),
    (s) => s.replace('hôm nay', 'tuần này'),
    // Add intensity variations
    (s) => s.replace('rất', 'quá'),
    (s) => s.replace('rất', 'lắm'),
    (s) => s.replace('rất', 'vãi'),
    (s) => s.replace('quá', 'rất'),
    (s) => s.replace('quá', 'lắm'),
    // Add question variations
    (s) => s + '?',
    (s) => s + ' nhé',
    (s) => s + ' bạn ơi',
    (s) => s + ' anh ơi',
    (s) => s + ' chị ơi',
    // Add negation
    (s) => 'Không ' + s.charAt(0).toLowerCase() + s.slice(1),
    (s) => 'Chưa ' + s.charAt(0).toLowerCase() + s.slice(1),
  ];
  
  const expanded = [...baseSentences];
  let idx = 0;
  while (expanded.length < targetCount && idx < baseSentences.length * 20) {
    const base = baseSentences[idx % baseSentences.length];
    const variation = variations[idx % variations.length];
    const newSentence = variation(base);
    if (!expanded.includes(newSentence)) {
      expanded.push(newSentence);
    }
    idx++;
  }
  return expanded.slice(0, targetCount);
}

const SENTENCES_1000 = expandSentences(VIETNAMESE_SENTENCES, 1000);

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(p / 100 * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function measureMemory() {
  const usage = process.memoryUsage();
  return {
    rss: formatBytes(usage.rss),
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal),
    external: formatBytes(usage.external),
  };
}

async function runBenchmark() {
  console.log('🚀 Vietnamese Language Support - Benchmark (P4.1)');
  console.log('='.repeat(60));
  console.log(`Testing ${SENTENCES_1000.length} Vietnamese sentences\n`);
  
  // Warmup
  console.log('🔥 Warming up...');
  for (let i = 0; i < 100; i++) {
    fixText(SENTENCES_1000[i % SENTENCES_1000.length]);
  }
  global.gc?.();
  
  const memBefore = measureMemory();
  console.log(`Memory before: RSS=${memBefore.rss}, Heap=${memBefore.heapUsed}`);
  
  // Benchmark fixText
  console.log('\n📊 Benchmarking fixText()...');
  const fixTextLatencies = [];
  const fixTextResults = [];
  
  for (let i = 0; i < SENTENCES_1000.length; i++) {
    const text = SENTENCES_1000[i];
    const start = performance.now();
    const result = fixText(text);
    const end = performance.now();
    fixTextLatencies.push(end - start);
    fixTextResults.push(result);
    
    if ((i + 1) % 200 === 0) {
      console.log(`  Processed ${i + 1}/1000...`);
    }
  }
  
  const memAfterFixText = measureMemory();
  console.log(`Memory after fixText: RSS=${memAfterFixText.rss}, Heap=${memAfterFixText.heapUsed}`);
  
  // Benchmark checkText
  console.log('\n📊 Benchmarking checkText()...');
  const checkTextLatencies = [];
  for (let i = 0; i < SENTENCES_1000.length; i++) {
    const text = SENTENCES_1000[i];
    const start = performance.now();
    checkText(text);
    const end = performance.now();
    checkTextLatencies.push(end - start);
  }
  
  // Benchmark getNativeAlternatives
  console.log('\n📊 Benchmarking getNativeAlternatives()...');
  const nativeLatencies = [];
  for (let i = 0; i < Math.min(200, SENTENCES_1000.length); i++) {
    const text = SENTENCES_1000[i];
    const start = performance.now();
    getNativeAlternatives(text);
    const end = performance.now();
    nativeLatencies.push(end - start);
  }
  
  // Benchmark searchIdioms
  console.log('\n📊 Benchmarking searchIdioms()...');
  const idiomQueries = ['kiên trì', 'nỗ lực', 'thành công', 'học tập', 'công việc', 'giúp đỡ', 'cảm ơn', 'xin lỗi', 'học hỏi', 'kiên nhẫn'];
  const idiomLatencies = [];
  for (let i = 0; i < 100; i++) {
    const query = idiomQueries[i % idiomQueries.length];
    const start = performance.now();
    searchIdioms(query);
    const end = performance.now();
    idiomLatencies.push(end - start);
  }
  
  // Benchmark getRegionalVariant
  console.log('\n📊 Benchmarking getRegionalVariant()...');
  const regionLatencies = [];
  const words = ['now', 'bây giờ', 'ngon', 'đẹp', 'mua', 'bán', 'ăn', 'uống', 'đi', 'về'];
  const regions = ['north', 'central', 'south'];
  for (let i = 0; i < 300; i++) {
    const word = words[i % words.length];
    const region = regions[i % regions.length];
    const start = performance.now();
    getRegionalVariant(word, region);
    const end = performance.now();
    regionLatencies.push(end - start);
  }
  
  const memAfter = measureMemory();
  console.log(`\nMemory after all benchmarks: RSS=${memAfter.rss}, Heap=${memAfter.heapUsed}`);
  
  // Calculate statistics
  const stats = {
    fixText: {
      count: fixTextLatencies.length,
      avg: (fixTextLatencies.reduce((a, b) => a + b, 0) / fixTextLatencies.length).toFixed(2),
      p50: percentile(fixTextLatencies, 50).toFixed(2),
      p95: percentile(fixTextLatencies, 95).toFixed(2),
      p99: percentile(fixTextLatencies, 99).toFixed(2),
      max: Math.max(...fixTextLatencies).toFixed(2),
      min: Math.min(...fixTextLatencies).toFixed(2),
    },
    checkText: {
      count: checkTextLatencies.length,
      avg: (checkTextLatencies.reduce((a, b) => a + b, 0) / checkTextLatencies.length).toFixed(2),
      p50: percentile(checkTextLatencies, 50).toFixed(2),
      p95: percentile(checkTextLatencies, 95).toFixed(2),
      p99: percentile(checkTextLatencies, 99).toFixed(2),
      max: Math.max(...checkTextLatencies).toFixed(2),
      min: Math.min(...checkTextLatencies).toFixed(2),
    },
    getNativeAlternatives: {
      count: nativeLatencies.length,
      avg: (nativeLatencies.reduce((a, b) => a + b, 0) / nativeLatencies.length).toFixed(2),
      p50: percentile(nativeLatencies, 50).toFixed(2),
      p95: percentile(nativeLatencies, 95).toFixed(2),
      p99: percentile(nativeLatencies, 99).toFixed(2),
      max: Math.max(...nativeLatencies).toFixed(2),
      min: Math.min(...nativeLatencies).toFixed(2),
    },
    searchIdioms: {
      count: idiomLatencies.length,
      avg: (idiomLatencies.reduce((a, b) => a + b, 0) / idiomLatencies.length).toFixed(2),
      p50: percentile(idiomLatencies, 50).toFixed(2),
      p95: percentile(idiomLatencies, 95).toFixed(2),
      p99: percentile(idiomLatencies, 99).toFixed(2),
      max: Math.max(...idiomLatencies).toFixed(2),
      min: Math.min(...idiomLatencies).toFixed(2),
    },
    getRegionalVariant: {
      count: regionLatencies.length,
      avg: (regionLatencies.reduce((a, b) => a + b, 0) / regionLatencies.length).toFixed(2),
      p50: percentile(regionLatencies, 50).toFixed(2),
      p95: percentile(regionLatencies, 95).toFixed(2),
      p99: percentile(regionLatencies, 99).toFixed(2),
      max: Math.max(...regionLatencies).toFixed(2),
      min: Math.min(...regionLatencies).toFixed(2),
    },
    memory: {
      before: memBefore,
      afterFixText: memAfterFixText,
      after: memAfter,
      deltaRSS: (parseFloat(memAfter.rss) - parseFloat(memBefore.rss)).toFixed(2) + ' MB',
      deltaHeap: (parseFloat(memAfter.heapUsed) - parseFloat(memBefore.heapUsed)).toFixed(2) + ' MB',
    }
  };
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📈 BENCHMARK RESULTS');
  console.log('='.repeat(60));
  
  for (const [fn, stat] of Object.entries(stats)) {
    if (fn === 'memory') continue;
    console.log(`\n${fn}:`);
    console.log(`  Count: ${stat.count}`);
    console.log(`  Avg:   ${stat.avg} ms`);
    console.log(`  P50:   ${stat.p50} ms`);
    console.log(`  P95:   ${stat.p95} ms ✅ ${parseFloat(stat.p95) < 5 ? 'PASS (<5ms)' : '❌ FAIL (>5ms)'}`);
    console.log(`  P99:   ${stat.p99} ms`);
    console.log(`  Min:   ${stat.min} ms`);
    console.log(`  Max:   ${stat.max} ms`);
  }
  
  console.log('\n💾 MEMORY USAGE:');
  console.log(`  Before:     RSS=${stats.memory.before.rss}, Heap=${stats.memory.before.heapUsed}`);
  console.log(`  After fixText: RSS=${stats.memory.afterFixText.rss}, Heap=${stats.memory.afterFixText.heapUsed}`);
  console.log(`  After all:  RSS=${stats.memory.after.rss}, Heap=${stats.memory.after.heapUsed}`);
  console.log(`  Delta RSS:  ${stats.memory.deltaRSS}`);
  console.log(`  Delta Heap: ${stats.memory.deltaHeap}`);
  console.log(`  Peak RSS Delta:   ${parseFloat(stats.memory.deltaRSS) < 50 ? '✅ PASS (<50MB delta)' : '❌ FAIL (>50MB delta)'}`);
  
  // Calculate correction rate
  const totalCorrections = fixTextResults.reduce((sum, r) => sum + (r.corrections?.length || 0), 0);
  const totalMixingIssues = fixTextResults.reduce((sum, r) => sum + (r.mixingIssues?.length || 0), 0);
  const correctionRate = ((fixTextResults.filter(r => r.corrections?.length > 0).length / fixTextResults.length) * 100).toFixed(1);
  const mixingDetectedRate = ((fixTextResults.filter(r => r.mixingIssues?.length > 0).length / fixTextResults.length) * 100).toFixed(1);
  
  console.log('\n📝 CORRECTION STATISTICS:');
  console.log(`  Total corrections: ${totalCorrections}`);
  console.log(`  Total mixing issues detected: ${totalMixingIssues}`);
  console.log(`  Correction rate: ${correctionRate}%`);
  console.log(`  Mixing detected rate: ${mixingDetectedRate}%`);
  
  // Overall verdict
  const fixTextP95Pass = parseFloat(stats.fixText.p95) < 5;
  const memoryPass = parseFloat(stats.memory.deltaRSS) < 50;
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 OVERALL VERDICT:');
  console.log(`  fixText P95 < 5ms: ${fixTextP95Pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Memory Delta < 50MB: ${memoryPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Overall: ${fixTextP95Pass && memoryPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60));
  
  // Return metrics for health check integration
  return {
    timestamp: new Date().toISOString(),
    fixText: stats.fixText,
    checkText: stats.checkText,
    getNativeAlternatives: stats.getNativeAlternatives,
    searchIdioms: stats.searchIdioms,
    getRegionalVariant: stats.getRegionalVariant,
    memory: stats.memory,
    correctionRate: parseFloat(correctionRate),
    mixingDetectedRate: parseFloat(mixingDetectedRate),
    totalCorrections,
    totalMixingIssues,
    passed: fixTextP95Pass && memoryPass
  };
}

// Export for programmatic use
export { runBenchmark, SENTENCES_1000 };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmark()
    .then(result => {
      process.exit(result.passed ? 0 : 1);
    })
    .catch(err => {
      console.error('❌ Benchmark failed:', err);
      process.exit(1);
    });
}
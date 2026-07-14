/**
 * P2.4: Regional Variant Auto-detection
 * Detects Vietnamese dialect region from text (North/Central/South)
 */

import { getAssets } from './assets.mjs';

// Regional vocabulary markers (loaded from assets + extended)
const REGION_MARKERS = {
  north: {
    vocabulary: new Set([
      'bây giờ', 'ngay bây giờ', 'hôm nay', 'ngày hôm nay', 'bữa nay',
      'đi', 'đến', 'về', 'ra', 'vào', 'lên', 'xuống', 'qua', 'lại',
      'này', 'kia', 'đó', 'nọ', 'ấy', 'đây', 'đâu', 'nào',
      'rất', 'quá', 'lắm', 'vãi', 'chết', 'không', 'không có', 'có',
      'mình', 'tôi', 'bạn', 'anh', 'chị', 'em', 'cô', 'chú', 'bác', 'ông', 'bà',
      'ăn', 'uống', 'ngủ', 'thức', 'làm', 'nghỉ', 'đi làm', 'về nhà',
      'xe ôm', 'xe bus', 'xe buýt', 'tàu hỏa', 'máy bay',
      'phố', 'ngõ', 'ngõ ngách', 'cửa hàng', 'chợ', 'siêu thị',
      'bún chả', 'phở', 'bánh cuốn', 'chả cá', 'bún riêu', 'bún thang',
      'trà đá', 'cà phê trứng', 'bia hơi', 'nhậu', 'quán', 'hàng',
      'đẹp trai', 'xinh gái', 'dễ thương', 'ngầu', 'chất', 'ngon', 'ngon lành',
      'mệt', 'khỏe', 'ốm', 'đau', 'bệnh', 'thuốc', 'bác sĩ', 'bệnh viện'
    ]),
    phrases: new Set([
      'bây giờ', 'ngay bây giờ', 'hôm nay', 'bữa nay',
      'đi đâu', 'về đâu', 'làm gì', 'ăn gì', 'uống gì',
      'không biết', 'không hiểu', 'không sao', 'không được',
      'bình thường', 'bình thường thôi', 'bình thường mà'
    ])
  },
  central: {
    vocabulary: new Set([
      'hôm nay', 'bây h', 'bây giờ', 'ngay hôm nay',
      'răng', 'mô', 'mô răng', 'chi', 'chi chi', 'ri', 'rứa', 'ráng',
      'mô', 'mời', 'mơi', 'mỡ', 'mỡ màng', 'mỡ màng lắm',
      'chiều', 'tối', 'sáng', 'trưa', 'ngày', 'ngày mai', 'ngày kia',
      'ăn cơm', 'ăn bữa', 'ăn trưa', 'ăn chiều', 'ăn tối', 'ăn sáng',
      'đi đâu', 'đi mô', 'đi răng', 'về mô', 'về răng',
      'mời ăn', 'mời uống', 'mời vào', 'mời ngồi',
      'bún bò', 'bún bò Huế', 'bánh bèo', 'bánh nậm', 'bánh lọc', 'bánh ít',
      'cơm hến', 'bún hến', 'cháo hến', 'nem lụi', 'nem chua',
      'trà đá', 'nước mía', 'cà phê sữa đá', 'bia', 'rượu',
      'ngon', 'ngon lắm', 'ngon răng', 'ngon mô', 'dở', 'dở lắm', 'dở mô',
      'đẹp', 'đẹp lắm', 'đẹp răng', 'xấu', 'xấu lắm', 'xấu răng'
    ]),
    phrases: new Set([
      'hôm nay', 'bây h', 'ngay hôm nay',
      'mời ăn cơm', 'mời uống trà', 'mời vào nhà',
      'ngon răng', 'ngon mô', 'dở răng', 'dở mô',
      'chi chi', 'răng răng', 'mô mô'
    ])
  },
  south: {
    vocabulary: new Set([
      'bây giờ', 'bây h', 'hiện tại', 'ngay bây giờ', 'hôm nay',
      'ăn cơm', 'ăn bữa', 'ăn trưa', 'ăn chiều', 'ăn tối', 'ăn sáng',
      'đi làm', 'về nhà', 'nghỉ ngơi', 'ngủ ngon', 'ngủ sớm', 'ngủ muộn',
      'xế', 'xế ông', 'xế bà', 'xế anh', 'xế chị', 'xế em',
      'mình', 'tớ', 'cậu', 'mày', 'tao', 'tui', 'mik',
      'không', 'ko', 'k', 'hok', 'hông', 'hệ', 'hệ gì', 'hệ chi',
      'biết', 'bik', 'bt', 'hiểu', 'hok hiểu', 'ko hiểu',
      'sao', 'tại sao', 'vì sao', 'tại sạo', 'sao đó', 'sao này',
      'đâu', 'đâu rồi', 'đi đâu', 'ở đâu', 'tại đâu',
      'gì', 'gì đó', 'gì này', 'chi', 'chi chi', 'gì chi',
      'được', 'đc', 'ok', 'oke', 'oki', 'được rồi', 'ok rồi',
      'cảm ơn', 'cám ơn', 'ck', 'thank', 'thanks', 'tks',
      'xin lỗi', 'sorry', 'sry', 'lỗi', 'lỗi rồi',
      'bún mắm', 'hủ tiếu', 'bánh xèo', 'bánh khọt', 'bánh căn', 'bánh bột lọc',
      'cơm tấm', 'cơm niêu', 'cơm gà', 'cơm sườn', 'cơm chiên', 'cơm rang',
      'trà đá', 'trà sữa', 'cà phê sữa đá', 'cà phê đen đá', 'nước ép', 'sinh tố',
      'bia', 'bia hơi', 'bia lon', 'rượu', 'nhậu', 'quán nhậu', 'quán trà đá',
      'ngon', 'ngon lắm', 'ngon quá', 'ngon vl', 'ngon vcl', 'ngon cmn',
      'dở', 'dở lắm', 'dở quá', 'dở vl', 'dở vcl', 'dở cmn',
      'đẹp', 'đẹp lắm', 'đẹp quá', 'đẹp trai', 'đẹp gái', 'xinh', 'xinh lắm', 'xinh quá',
      'mệt', 'mệt lắm', 'mệt quá', 'khỏe', 'khỏe lắm', 'khỏe quá',
      'ốm', 'ốm lắm', 'ốm quá', 'đau', 'đau lắm', 'đau quá',
      'tiền', 'tiền nào', 'tiền đâu', 'giá', 'giá nào', 'giá bao nhiêu',
      'mua', 'mua gì', 'mua đâu', 'bán', 'bán gì', 'bán đâu',
      'shop', 'store', 'online', 'ship', 'cod', 'chuyển khoản', 'momo', 'zalopay'
    ]),
    phrases: new Set([
      'bây giờ', 'bây h', 'hiện tại', 'ngay bây giờ',
      'ăn cơm chưa', 'ăn bữa chưa', 'ăn trưa chưa', 'ăn chiều chưa', 'ăn tối chưa', 'ăn sáng chưa',
      'đi đâu đấy', 'về đâu đấy', 'làm gì đấy', 'ăn gì đấy',
      'không biết', 'ko bik', 'k bik', 'hok bik',
      'sao không', 'tại sao không', 'vì sao không',
      'được không', 'đc không', 'ok không', 'oke không',
      'cảm ơn', 'cám ơn', 'ck', 'thank', 'tks',
      'xin lỗi', 'sorry', 'sry', 'lỗi rồi',
      'ngon quá', 'ngon vl', 'ngon vcl', 'dở quá', 'dở vl', 'dở vcl',
      'mua đi', 'bán đi', 'ship đi', 'cod đi'
    ])
  }
};

function scoreRegion(text) {
  const words = text.toLowerCase()
    .replace(/[.,!?;:()\[\]{}""']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  const scores = { north: 0, central: 0, south: 0 };
  
  for (const word of words) {
    for (const region of ['north', 'central', 'south']) {
      if (REGION_MARKERS[region].vocabulary.has(word)) {
        scores[region] += 2;
      }
      // Check phrases (simple n-gram matching)
      for (const phrase of REGION_MARKERS[region].phrases) {
        if (text.toLowerCase().includes(phrase)) {
          scores[region] += 5;
        }
      }
    }
  }
  
  return scores;
}

export function detectRegion(text) {
  const scores = scoreRegion(text);
  const total = scores.north + scores.central + scores.south;
  
  if (total === 0) {
    return { region: 'unknown', confidence: 0, markers: [] };
  }
  
  let maxRegion = 'north';
  let maxScore = scores.north;
  if (scores.central > maxScore) { maxScore = scores.central; maxRegion = 'central'; }
  if (scores.south > maxScore) { maxScore = scores.south; maxRegion = 'south'; }
  
  const confidence = maxScore / total;
  
  // Find matched markers
  const matchedMarkers = [];
  const lowerText = text.toLowerCase();
  for (const marker of REGION_MARKERS[maxRegion].vocabulary) {
    if (lowerText.includes(marker)) matchedMarkers.push(marker);
  }
  for (const marker of REGION_MARKERS[maxRegion].phrases) {
    if (lowerText.includes(marker)) matchedMarkers.push(marker);
  }
  
  return {
    region: maxRegion,
    confidence: Math.round(confidence * 100) / 100,
    scores,
    markers: [...new Set(matchedMarkers)].slice(0, 10)
  };
}

export function getRegionalVariantAuto(word, region) {
  const assets = getAssets();
  const regionData = assets.regionalVariants?.regions?.[region];
  if (!regionData) return word;
  
  const vocab = regionData.vocabulary || {};
  if (vocab[word]) return vocab[word];
  
  for (const [key, value] of Object.entries(vocab)) {
    if (key.toLowerCase() === word.toLowerCase()) return value;
  }
  
  const phrases = regionData.phrases || {};
  if (phrases[word]) return phrases[word];
  
  return word;
}
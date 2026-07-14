/**
 * P3.2: Lao Language Context (Vietnamese-Lao Phrasebook)
 * Vietnamese-Lao phrasebook for worker communication (from Ba's notes)
 */

export const LAO_VOCAB = {
  // Vietnamese-Lao phrasebook for worker communication
  phrases: {
    // Greetings
    'Xin chào': 'Sabaidee',
    'Chào buổi sáng': 'Sabaidee ton sao',
    'Chào buổi chiều': 'Sabaidee vai',
    'Chào buổi tối': 'Sabaidee nyam',
    'Tạm biệt': 'La khon',
    'Hẹn gặp lại': 'Pop kan mai',
    
    // Work communication
    'Bạn khỏe không?': 'Sabaidee baw?',
    'Làm việc chăm chỉ nhé': 'Het ngam deng',
    'Cố lên': 'Su su',
    'Hiểu chưa?': 'Kao jai baw?',
    'Làm theo hướng dẫn': 'Het long song',
    'An toàn trước hết': 'Sua phap diaw',
    'Nghỉ ngơi': 'Pob',
    'Ăn trưa': 'Kin khao',
    'Uống nước': 'Kin nam',
    'Về nhà': 'Pai ban',
    'Đi làm': 'Pai het',
    'Muộn': 'Sao',
    'Sớm': 'Sao',
    
    // Safety/Instructions
    'Cẩn thận': 'Lua lua',
    'Đừng làm vậy': 'Yak het an ni',
    'Đi đường này': 'Pai tang ni',
    'Đội mũ bảo hiểm': 'Sab mu bao hiem',
    'Mặc áo phản quang': 'Sai ao fan quang',
    'Kiểm tra thiết bị': 'Sop kha khrueang',
    'Báo cáo sự cố': 'Bao cao su co',
    'Gọi cấp cứu': 'Tho poi ban',
    
    // Daily needs
    'Bạn có đói không?': 'Baw hiw baw?',
    'Bạn có khát không?': 'Baw hiw nam baw?',
    'Nhà vệ sinh ở đâu?': 'Hong nam yu sai?',
    'Xe buýt đi đâu?': 'Lot mai pai sai?',
    'Bao nhiêu tiền?': 'Thao dai?',
    'Đắt quá': 'Peng lai',
    'Giảm giá được không?': 'Lot ha dai baw?',
    
    // Emergency/Health
    'Bạn ốm à?': 'Pen kai baw?',
    'Đau đâu?': 'Cep sai?',
    'Đau đầu': 'Cep hua',
    'Đau bụng': 'Cep tong',
    'Sốt': 'Khai',
    'Ho': 'I',
    'Uống thuốc': 'Kin ya',
    'Đi bệnh viện': 'Pai rong phayaban',
    'Gọi bác sĩ': 'Tho mo'
  },
  
  // Word-level mappings
  wordMap: {
    'khỏe': 'sabaidee',
    'cảm ơn': 'khop chai',
    'xin lỗi': 'kho thot',
    'vâng/dạ': 'doi',
    'không': 'baw',
    'có': 'mi',
    'ăn': 'kin',
    'uống': 'kin nam',
    'ngủ': 'non',
    'đi': 'pai',
    'về': 'pai ban',
    'làm': 'het',
    'hiểu': 'kao jai',
    'không hiểu': 'baw kao jai',
    'chậm': 'cha cha',
    'nhanh': 're re',
    'tốt': 'dee',
    'xấu': 'baw dee',
    'đắt': 'peng',
    'rẻ': 'thuk',
    'nóng': 'hon',
    'lạnh': 'yen',
    'mưa': 'fon tok',
    'nắng': 'det'
  }
};

export function getLaoDomainConfig() {
  return {
    domain: 'lao',
    phrases: LAO_VOCAB.phrases,
    wordMap: LAO_VOCAB.wordMap
  };
}
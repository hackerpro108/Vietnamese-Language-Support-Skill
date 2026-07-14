export const GAME_VOCAB = {
  // Protected game terms (never stripped)
  protectedTerms: [
    'MMO', 'RPG', 'MMORPG', 'PvP', 'PvE', 'Raid', 'Dungeon', 'Boss', 'NPC',
    'XP', 'EXP', 'Level', 'LevelUp', 'Skill', 'Item', 'Gear', 'Equipment',
    'Inventory', 'Quest', 'Mission', 'Achievement', 'Leaderboard', 'Ranking',
    'Guild', 'Clan', 'Party', 'Raid', 'Dungeon', 'Instance',
    'Gold', 'Silver', 'Copper', 'Coin', 'Currency', 'Token', 'Gem', 'Crystal',
    'Shop', 'Store', 'Market', 'Auction', 'Trade', 'Exchange', 'AuctionHouse',
    'Craft', 'Crafting', 'Recipe', 'Material', 'Resource', 'Gather', 'Farm',
    'Grind', 'Farm', 'AFK', 'Idle', 'Auto', 'Bot', 'Cheat', 'Hack', 'Exploit',
    'Patch', 'Update', 'Hotfix', 'Maintenance', 'Server', 'Channel', 'Region',
    'Login', 'Logout', 'Register', 'Account', 'Character', 'Avatar', 'Class',
    'Race', 'Faction', 'Alignment', 'Reputation', 'Honor', 'Glory', 'Fame',
    // Thiên Tài Kinh Doanh specific
    'Cá', 'Câu', 'Cần', 'Mồi', 'Hồ', 'Biển', 'Sông', 'Hồ cá', 'Cá vàng', 'Cá rồng',
    'Trồng', 'Cây', 'Hạt', 'Mua', 'Bán', 'Thu hoạch', 'Phân bón', 'Nước', 'Thời gian',
    'Chăn nuôi', 'Gà', 'Heo', 'Bò', 'Cừu', 'Thỏ', 'Thức ăn', 'Trại', 'Chuồng',
    'Kinh doanh', 'Cửa hàng', 'Siêu thị', 'Chợ', 'Khách', 'Doanh thu', 'Lợi nhuận',
    'Cổ phiếu', 'Chứng khoán', 'Mua vào', 'Bán ra', 'Giá', 'Sàn', 'Trần', 'Khớp lệnh',
    'Crypto', 'Bitcoin', 'Ethereum', 'Altcoin', 'DeFi', 'Staking', 'Yield', 'Farm',
    'NFT', 'Mint', 'Gas', 'Wallet', 'Private key', 'Seed phrase', 'DEX', 'CEX'
  ],
  
  // Word replacements
  wordReplacements: {
    'câu cá': 'đi câu',
    'bán cá': 'bán thu hoạch',
    'trồng cây': 'gieo trồng',
    'mua bán': 'giao dịch',
    'kiếm tiền': 'sinh lời',
    'mất tiền': 'thua lỗ',
    'tăng cấp': 'level up',
    'kỹ năng': 'skill',
    'trang bị': 'gear',
    'túi đồ': 'inventory',
    'nhiệm vụ': 'quest',
    'thành tựu': 'achievement',
    'bảng xếp hạng': 'leaderboard',
    'công hội': 'guild',
    'đội': 'party',
    'phó bản': 'dungeon',
    'boss': 'boss',
    'vàng': 'gold',
    'bạc': 'silver',
    'đồng': 'copper',
    'tiền': 'coin',
    'cửa hàng': 'shop',
    'chợ': 'market',
    'đấu giá': 'auction',
    'trao đổi': 'trade',
    'chế tạo': 'craft',
    'nguyên liệu': 'material',
    'tài nguyên': 'resource',
    'cày': 'grind',
    'treo máy': 'afk',
    'tự động': 'auto',
    'bản vá': 'patch',
    'bảo trì': 'maintenance',
    'máy chủ': 'server',
    'kênh': 'channel',
    'khu vực': 'region',
    'đăng nhập': 'login',
    'đăng xuất': 'logout',
    'đăng ký': 'register',
    'tài khoản': 'account',
    'nhân vật': 'character',
    'lớp': 'class',
    'chủng tộc': 'race',
    'phe phái': 'faction',
    'danh vọng': 'reputation',
    'vinh danh': 'honor',
    'vinh quang': 'glory'
  },
  
  formalToCasual: {
    'Tôi đang câu cá': ['Mình đang câu', 'Mình đi câu'],
    'Tôi trồng cây': ['Mình trồng', 'Mình gieo'],
    'Tôi kinh doanh': ['Mình kinh doanh', 'Mình làm buôn'],
    'Tôi mua cổ phiếu': ['Mình mua cp', 'Mấy cp này'],
    'Tôi stake crypto': ['Mình stake', 'Mình gác coin'],
    'Cửa hàng của tôi': ['Shop mình', 'Tiệm mình'],
    'Lợi nhuận cao': ['Lãi ngon', 'Lãi khủng'],
    'Thua lỗ nặng': ['Thua sòng', 'Thua bét']
  }
};

export function getGameDomainConfig() {
  return {
    domain: 'game',
    protectedTerms: GAME_VOCAB.protectedTerms,
    wordReplacements: GAME_VOCAB.wordReplacements,
    formalToCasual: GAME_VOCAB.formalToCasual
  };
}

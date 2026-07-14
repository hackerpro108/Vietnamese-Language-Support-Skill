export const FINANCE_VOCAB = {
  protectedTerms: [
    'Stock', 'Share', 'Equity', 'Bond', 'ETF', 'Fund', 'Portfolio', 'Asset',
    'Dividend', 'Yield', 'P/E', 'P/B', 'ROE', 'ROA', 'EPS', 'Market Cap',
    'Bull', 'Bear', 'Volatility', 'Liquidity', 'Leverage', 'Margin', 'Short',
    'Long', 'Option', 'Call', 'Put', 'Strike', 'Expiry', 'Premium',
    'Forex', 'FX', 'Currency', 'Pair', 'Pip', 'Lot', 'Spread', 'Swap',
    'Crypto', 'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Altcoin', 'Stablecoin',
    'USDT', 'USDC', 'BUSD', 'DeFi', 'CeFi', 'DEX', 'CEX', 'AMM', 'LP',
    'Staking', 'Yield Farming', 'Liquidity Mining', 'APY', 'APR', 'TVL',
    'Smart Contract', 'Gas', 'Gwei', 'Nonce', 'Tx', 'Hash', 'Block',
    'Wallet', 'Private Key', 'Public Key', 'Seed Phrase', 'Mnemonic',
    'Cold Wallet', 'Hot Wallet', 'Hardware Wallet', 'Ledger', 'Trezor',
    'KYC', 'AML', 'Whitelist', 'Blacklist', 'Sanctions', 'Compliance',
    'IPO', 'IPO', 'SPAC', 'Direct Listing', 'Lockup', 'Vesting',
    'VC', 'PE', 'Angel', 'Seed', 'Series A', 'Series B', 'Series C',
    'Valuation', 'Pre-money', 'Post-money', 'Cap Table', 'Dilution',
    'Term Sheet', 'SAFE', 'Convertible Note', 'Equity', 'Preferred',
    'Common', 'Warrant', 'Option Pool', 'ESOP', '409A'
  ],
  
  wordReplacements: {
    'mua cổ phiếu': 'mua cp',
    'bán cổ phiếu': 'bán cp',
    'chứng khoán': 'ck',
    'thị trường': 'market',
    'giá cao': 'giá cao',
    'giá thấp': 'giá thấp',
    'tăng giá': 'pump',
    'giảm giá': 'dump',
    'biến động': 'volatility',
    'rủi ro': 'risk',
    'lợi nhuận': 'profit',
    'lỗ': 'loss',
    'cân đối': 'break even',
    'chia cổ tức': 'dividend',
    'tái đầu tư': 'reinvest',
    'đầu tư giá trị': 'value investing',
    'đầu tư tăng trưởng': 'growth investing',
    'phân tích cơ bản': 'fundamental',
    'phân tích kỹ thuật': 'technical',
    'đồ thị': 'chart',
    'nến': 'candle',
    'khối lượng': 'volume',
    'đường trung bình': 'MA',
    'RSI': 'RSI',
    'MACD': 'MACD',
    'Bollinger': 'BB',
    'hỗ trợ': 'support',
    'kháng cự': 'resistance',
    'xu hướng': 'trend',
    'biến động': 'swing',
    'ngắn hạn': 'short term',
    'dài hạn': 'long term',
    'diversification': 'đa dạng hóa',
    'hedge': 'hedge',
    'arbitrage': 'arbitrage'
  },
  
  formalToCasual: {
    'Tôi đầu tư vào cổ phiếu': ['Mình đầu tư cp', 'Mình vào cp này'],
    'Tôi mua Bitcoin': ['Mình mua BTC', 'Mình vào BTC'],
    'Tôi stake Ethereum': ['Mình stake ETH', 'Mình gác ETH'],
    'Tôi phân tích cơ bản': ['Mình đọc fundamental', 'Mình research'],
    'Tôi theo dõi đồ thị': ['Mình nhìn chart', 'Mình watch chart'],
    'Danh mục đầu tư của tôi': ['Portfolio mình', 'Bag mình'],
    'Lợi nhuận của tôi': ['Profit mình', 'Lãi mình'],
    'Rủi ro cao': ['Rủi ro lớn', 'Đánh bạc'],
    'An toàn': ['Safe', 'Chắc chắn']
  }
};

export function getFinanceDomainConfig() {
  return {
    domain: 'finance',
    protectedTerms: FINANCE_VOCAB.protectedTerms,
    wordReplacements: FINANCE_VOCAB.wordReplacements,
    formalToCasual: FINANCE_VOCAB.formalToCasual
  };
}

import { fixText, getNativeAlternatives } from './dist/index.mjs';

console.log('--- P3.3 Game Domain ---');
const gameFix = fixText('Tôi câu cá, trồng cây, mua bán cổ phiếu, stake Bitcoin', {domain: 'game'});
console.log('Fix text:', gameFix.fixed);

const gameAlt = getNativeAlternatives('Tôi đang câu cá và kinh doanh', {domain: 'game', relationship: 'peer'});
console.log('Alternatives:', gameAlt.map(a => a.suggestedText));

console.log('\n--- P3.4 Finance Domain ---');
const finFix = fixText('Tôi mua cổ phiếu Apple, stake Ethereum, phân tích kỹ thuật', {domain: 'finance'});
console.log('Fix text:', finFix.fixed);

const finAlt = getNativeAlternatives('Portfolio tôi tăng 20%', {domain: 'finance', relationship: 'peer'});
console.log('Alternatives:', finAlt.map(a => a.suggestedText));

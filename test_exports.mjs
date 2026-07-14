import { fixText, fixSpellingAndTone, fixSegmentation, detectMixing, stripMixing, getNativeAlternatives, searchIdioms, getRegionalVariant, detectRegion, rewriteSentenceStructure, loadConfig, healthCheck } from './dist/index.mjs';

console.log('Testing exports...');
console.log('fixText:', typeof fixText);
console.log('fixSpellingAndTone:', typeof fixSpellingAndTone);
console.log('fixSegmentation:', typeof fixSegmentation);
console.log('detectMixing:', typeof detectMixing);
console.log('stripMixing:', typeof stripMixing);
console.log('getNativeAlternatives:', typeof getNativeAlternatives);
console.log('searchIdioms:', typeof searchIdioms);
console.log('getRegionalVariant:', typeof getRegionalVariant);
console.log('detectRegion:', typeof detectRegion);
console.log('rewriteSentenceStructure:', typeof rewriteSentenceStructure);
console.log('loadConfig:', typeof loadConfig);
console.log('healthCheck:', typeof healthCheck);

const result = fixText('Day la cau tieng Viet khong dau');
console.log('fixText result:', result.fixed);

const result2 = fixSpellingAndTone('Day la cau tieng Viet khong dau');
console.log('fixSpellingAndTone result:', result2.text);

const result3 = fixSegmentation('lamviec anngu');
console.log('fixSegmentation result:', result3.text);

const result4 = detectMixing('Tieng Viet的');
console.log('detectMixing result:', result4);

const result5 = stripMixing('Tieng Viet的');
console.log('stripMixing result:', result5.text);

const result6 = getNativeAlternatives('Toi nghi la');
console.log('getNativeAlternatives result:', result6.length, 'alternatives');

const result7 = searchIdioms('kien tri');
console.log('searchIdioms result:', result7.length, 'idioms');

const result8 = getRegionalVariant('now', 'south');
console.log('getRegionalVariant result:', result8);

const result9 = detectRegion('Xin chao ban');
console.log('detectRegion result:', result9);

const result10 = rewriteSentenceStructure('Bai nay duoc viet boi toi');
console.log('rewriteSentenceStructure result:', result10.text);

console.log('All tests passed!');
import { fixText, checkText, getNativeAlternatives, searchIdioms, getRegionalVariant, healthCheck } from './dist/index.mjs';

const result = fixText('Model的 này hơi yếu tiếng Việt的');
console.log('=== fixText ===');
console.log('Original:', result.original);
console.log('Fixed:', result.fixed);
console.log('Corrections:', result.corrections);
console.log('Mixing:', result.mixingIssues);

const check = checkText('Tôi think rằng này okay');
console.log('\n=== checkText ===');
console.log('Original:', check.original);
console.log('Issues:', check.mixingIssues);

const native = getNativeAlternatives('Tôi nghĩ là');
console.log('\n=== native ===');
console.log(native);

const idioms = searchIdioms('kiên trì');
console.log('\n=== idiom ===');
console.log(idioms);

const region = getRegionalVariant('now', 'south');
console.log('\n=== region ===');
console.log(region);

const health = await healthCheck();
console.log('\n=== health ===');
console.log(health);
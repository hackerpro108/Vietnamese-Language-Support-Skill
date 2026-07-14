/**
 * Vietnamese Language Support - CLI Entry Point
 */

import { 
  fixText, checkText, getNativeAlternatives, 
  searchIdioms, getRegionalVariant, healthCheck 
} from './index.mjs';

function parseArgs(args) {
  const options = { domain: 'general', relationship: 'peer', formality: 'auto' };
  const positional = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--domain' && i + 1 < args.length) {
      options.domain = args[++i];
    } else if (arg === '--relationship' && i + 1 < args.length) {
      options.relationship = args[++i];
    } else if (arg === '--formality' && i + 1 < args.length) {
      options.formality = args[++i];
    } else {
      positional.push(arg);
    }
  }
  return { options, positional };
}

const args = process.argv.slice(2);
const command = args[0];
const { options, positional } = parseArgs(args.slice(1));
const input = positional.join(' ');

switch (command) {
  case 'fix': {
    if (!input) { console.error('Error: No text provided'); process.exit(1); }
    const result = fixText(input, { domain: options.domain });
    console.log('Original:', result.original);
    console.log('Fixed:   ', result.fixed);
    if (result.corrections.length > 0) {
      console.log('\nCorrections:');
      for (const c of result.corrections) console.log(`  - ${c.type}: "${c.from}" → "${c.to}"${c.count && c.count > 1 ? ` (${c.count}x)` : ''}`);
    }
    if (result.mixingIssues.length > 0) {
      console.log('\nLanguage Mixing Detected:');
      for (const i of result.mixingIssues) console.log(`  - ${i.type}: "${i.token}" at ${i.positions ? i.positions.join(', ') : i.position}`);
    }
    if (result.nativeAlternatives.length > 0) {
      console.log('\nNative Alternatives:');
      for (const a of result.nativeAlternatives) {
        if (a.alternatives) console.log(`  - ${a.type}: "${a.original}" → ${a.alternatives.join(', ')}`);
        else console.log(`  - ${a.type}: "${a.original}" → "${a.alternative}"`);
      }
    }
    break;
  }
  case 'check': {
    if (!input) { console.error('Error: No text provided'); process.exit(1); }
    const result = checkText(input);
    console.log('Original:', result.original);
    console.log('\nIssues Found:');
    let hasIssues = false;
    if (result.corrections.length > 0) {
      console.log('  Spelling/Tone:');
      for (const c of result.corrections) console.log(`    - ${c.type}: "${c.from}" → "${c.to}"`);
      hasIssues = true;
    }
    if (result.mixingIssues.length > 0) {
      console.log('  Language Mixing:');
      for (const i of result.mixingIssues) console.log(`    - ${i.type}: "${i.token}" at ${i.positions ? i.positions.join(', ') : i.position}`);
      hasIssues = true;
    }
    if (!hasIssues) console.log('  None!');
    break;
  }
  case 'native': {
    if (!input) { console.error('Error: No phrase provided'); process.exit(1); }
    const alts = getNativeAlternatives(input, { 
      domain: options.domain, 
      relationship: options.relationship, 
      formality: options.formality 
    });
    console.log('Phrase:', input);
    console.log('\nNative Alternatives:');
    if (alts.length > 0) {
      for (const a of alts) {
        if (a.alternatives) console.log(`  - ${a.type}: "${a.original}" → ${a.alternatives.join(', ')}`);
        else console.log(`  - ${a.type}: "${a.original}" → "${a.alternative}"`);
      }
    } else console.log('  No alternatives found.');
    break;
  }
  case 'idiom': {
    if (!input) { console.error('Error: No keyword provided'); process.exit(1); }
    const results = searchIdioms(input);
    console.log(`Idioms matching "${input}":`);
    if (results.length > 0) {
      for (const r of results) {
        console.log(`\n  ${r.phrase}`);
        console.log(`  Nghĩa: ${r.meaning}`);
        console.log(`  English: ${r.english}`);
        console.log(`  Category: ${r.category}`);
        if (r.usage) console.log(`  Usage: ${r.usage}`);
      }
    } else console.log('  No idioms found.');
    break;
  }
  case 'region': {
    const word = positional[0];
    const region = positional[1] || 'north';
    if (!word) { console.error('Error: No word and/or region provided'); process.exit(1); }
    const variant = getRegionalVariant(word, region);
    console.log(`Word: "${word}" in ${region}`);
    console.log(`Variant: ${variant}`);
    break;
  }
  case 'health': {
    const health = await healthCheck();
    console.log('Health Check:', JSON.stringify(health, null, 2));
    break;
  }
  default:
    console.log(`
Vietnamese Language Support CLI

Usage: vn-lang <command> [options] [args]

Commands:
  fix <text>           Fix spelling, tone marks, segmentation, strip mixing
  check <text>         Check for issues without auto-fixing
  native <phrase>      Get native-sounding alternatives
  idiom <keyword>      Search Vietnamese idioms/proverbs
  region <word> <north|central|south>  Get regional variant
  health               Health check

Options:
  --domain <domain>    Domain: general | it | lao (default: general)
  --relationship <rel> Relationship: peer | older | younger | formal (default: peer)
  --formality <level>  Formality: auto | formal | casual (default: auto)

Examples:
  vn-lang fix "Model的 này hơi yếu tiếng Việt的"
  vn-lang check "Tôi think rằng này okay"
  vn-lang native "Tôi nghĩ là"
  vn-lang native "Tôi cần deploy feature" --domain it
  vn-lang native "Xin chào, bạn khỏe không?" --domain lao
  vn-lang idiom "kiên trì"
  vn-lang region "now" south
`);
}
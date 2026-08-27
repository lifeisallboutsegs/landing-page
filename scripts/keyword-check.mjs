import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { research } = await import('../src/server/keywords/research.js');

const t0 = Date.now();
const out = await research('roof repair', { depth: 'standard', location: 'london' });
console.log(`  seed: "${out.seed}"  provider: ${out.provider.label}  in ${Date.now() - t0}ms`);
console.log(`  total phrases: ${out.total}`);
console.log(`  volume reported: ${out.keywords[0]?.volume === null ? 'null (honest)' : out.keywords[0]?.volume}`);
console.log('\n  top 12 by opportunity:');
for (const k of out.keywords.slice(0, 12)) {
  console.log(`    ${String(k.opportunity).padStart(5)}  diff ${String(k.difficulty).padStart(2)}  ${k.intent.padEnd(14)} ${k.keyword}`);
}
console.log('\n  clusters:');
for (const c of out.clusters.slice(0, 5)) {
  console.log(`    ${c.topic} (${c.count}): ${c.keywords.slice(0, 3).join(' / ')}`);
}

import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { assertSafeUrl } = await import('../src/server/audit/safe-fetch.js');

const attacks = [
  ['http://localhost:5432',                 'Postgres on this box'],
  ['http://127.0.0.1:3012/admin',           'our own admin panel'],
  ['http://169.254.169.254/latest/meta-data/', 'cloud metadata (credentials!)'],
  ['http://[::1]:5432',                     'IPv6 loopback'],
  ['http://0.0.0.0',                        '"this host"'],
  ['http://10.0.0.5',                       'private network'],
  ['http://192.168.1.1',                    'home router'],
  ['http://172.16.0.1',                     'private 172.16/12'],
  ['file:///etc/passwd',                    'local file'],
  ['gopher://evil',                         'gopher protocol'],
  ['http://user:pass@example.com',          'embedded credentials'],
  ['http://[::ffff:127.0.0.1]',             'IPv4 loopback smuggled via IPv6'],
  ['http://[::ffff:169.254.169.254]',       'metadata smuggled via IPv6'],
  ['http://[::ffff:a00:5]',                 'private 10.0.0.5 in IPv6 hex'],
  ['http://[::ffff:c0a8:101]',              'private 192.168.1.1 in IPv6 hex'],
];

let blocked = 0;
for (const [url, why] of attacks) {
  try {
    await assertSafeUrl(url);
    console.log(`  ALLOWED  ${url}  <-- ${why}`);
  } catch (e) {
    blocked += 1;
    console.log(`  blocked  ${url.padEnd(42)} (${why})`);
  }
}
console.log(`\n  ${blocked}/${attacks.length} attacks blocked`);

console.log('\n  legitimate URL should pass:');
try {
  const r = await assertSafeUrl('https://example.com');
  console.log(`  allowed  https://example.com -> ${r.address}`);
} catch (e) { console.log('  FAILED:', e.message); }

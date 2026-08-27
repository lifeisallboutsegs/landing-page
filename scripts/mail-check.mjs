import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { verifyConnection, sendLeadNotification } = await import('../src/server/mail.js');

console.log(`  host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} as ${process.env.SMTP_USER}`);
try {
  await verifyConnection();
  console.log('  SMTP connection + auth: OK');
} catch (e) {
  console.log('  SMTP connection FAILED:', e.message);
  process.exit(1);
}

if (process.argv.includes('--send')) {
  const r = await sendLeadNotification({
    name: 'SMTP Test', email: 'test@example.com', service: 'SEO',
    message: 'This is a delivery test from the DWA site.',
    utmSource: 'test', landingPage: '/',
  });
  console.log('  test send:', r);
}
process.exit(0);

/**
 * Security and transport checks for the audit.
 *
 * Two independent sources, so one being down never blanks this section:
 *
 *  1. The response headers we already fetched — HSTS, CSP, clickjacking and
 *     MIME-sniffing protections, and whether the server is advertising its
 *     stack. Zero extra requests, always available.
 *  2. Mozilla's HTTP Observatory (free, no key, 1 scan/min/host, 24h cache),
 *     which grades the same surface A+ to F with its own scoring. Best-effort.
 *
 * Search engines factor HTTPS and, increasingly, page security into ranking and
 * into the browser trust signals users act on, so this belongs in an SEO audit.
 */

const OBSERVATORY = 'https://observatory-api.mdn.mozilla.net/api/v2/scan';

const has = (headers, name) => {
  const v = headers.get(name);
  return v == null ? null : v;
};

/** Deterministic checks against the headers the page already returned. */
function inspectHeaders(finalUrl, headers) {
  const findings = [];
  const isHttps = finalUrl.startsWith('https://');

  const hsts = has(headers, 'strict-transport-security');
  const csp = has(headers, 'content-security-policy');
  const xcto = has(headers, 'x-content-type-options');
  const xfo = has(headers, 'x-frame-options');
  const refPol = has(headers, 'referrer-policy');
  const permPol = has(headers, 'permissions-policy');
  const encoding = has(headers, 'content-encoding');
  const server = has(headers, 'server');
  const poweredBy = has(headers, 'x-powered-by');
  // A proxy brand such as "cloudflare" is unavoidable and does not disclose a
  // vulnerable version. Versioned Server values and X-Powered-By are useful to
  // an attacker and remain findings.
  const serverStack = [
    server && /\d/.test(server) ? server : null,
    poweredBy,
  ].filter(Boolean);

  if (!isHttps) {
    findings.push({
      id: 'no-https', severity: 'critical', title: 'The page is served over plain HTTP',
      detail: 'Browsers mark it "Not secure", and Google has used HTTPS as a ranking signal since 2014.',
      fix: 'Install a TLS certificate (Let’s Encrypt is free) and 301-redirect all HTTP traffic to HTTPS.',
    });
  } else if (!hsts) {
    findings.push({
      id: 'no-hsts', severity: 'low', title: 'No HSTS header',
      detail: 'Without Strict-Transport-Security the first visit each session can still be downgraded to HTTP.',
      fix: 'Send "Strict-Transport-Security: max-age=31536000; includeSubDomains" once HTTPS is stable.',
    });
  }

  if (!csp) {
    findings.push({
      id: 'no-csp', severity: 'low', title: 'No Content-Security-Policy',
      detail: 'A CSP is the main defence against injected scripts stealing form input or defacing the page.',
      fix: 'Add a Content-Security-Policy header, starting in report-only mode while you tune it.',
    });
  }
  if (xcto?.toLowerCase() !== 'nosniff') {
    findings.push({
      id: 'no-nosniff', severity: 'low', title: 'No X-Content-Type-Options: nosniff',
      detail: 'The browser is allowed to guess content types, which enables some injection attacks.',
      fix: 'Add "X-Content-Type-Options: nosniff".',
    });
  }
  if (!xfo && !csp?.includes('frame-ancestors')) {
    findings.push({
      id: 'no-framing-protection', severity: 'low', title: 'Page can be framed by any site',
      detail: 'No X-Frame-Options or CSP frame-ancestors, so the page can be embedded for clickjacking.',
      fix: 'Add "X-Frame-Options: SAMEORIGIN" or a CSP "frame-ancestors \'self\'" directive.',
    });
  }
  if (serverStack.length) {
    findings.push({
      id: 'stack-disclosure', severity: 'low', title: 'Server advertises its software version',
      detail: `Response headers expose: ${serverStack.join(', ')}. That hands attackers a shortlist of known CVEs to try.`,
      fix: 'Strip or generalise the Server and X-Powered-By headers at the web server or CDN.',
    });
  }
  if (!encoding) {
    findings.push({
      id: 'no-compression', severity: 'medium', title: 'Response is not compressed',
      detail: 'No Content-Encoding header — HTML, CSS and JS are being sent uncompressed, which slows every load.',
      fix: 'Enable gzip or, better, Brotli compression at the server or CDN.',
    });
  }

  return {
    https: isHttps,
    headers: {
      hsts: Boolean(hsts),
      csp: Boolean(csp),
      xContentTypeOptions: xcto?.toLowerCase() === 'nosniff',
      frameProtection: Boolean(xfo) || Boolean(csp?.includes('frame-ancestors')),
      referrerPolicy: refPol ?? null,
      permissionsPolicy: Boolean(permPol),
      compression: encoding ?? null,
    },
    stackDisclosure: serverStack,
    findings,
  };
}

/** Mozilla HTTP Observatory — a second opinion with a letter grade. Best-effort. */
async function observatory(host) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${OBSERVATORY}?host=${encodeURIComponent(host)}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.error || typeof data?.grade !== 'string') return null;
    return {
      grade: data.grade,
      score: typeof data.score === 'number' ? data.score : null,
      testsPassed: data.tests_passed ?? null,
      testsFailed: data.tests_failed ?? null,
      detailsUrl: data.details_url ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function inspectSecurity(finalUrl, responseHeaders) {
  let host;
  try {
    host = new URL(finalUrl).host;
  } catch {
    return { included: false };
  }

  const [headerReport, obs] = await Promise.all([
    Promise.resolve(inspectHeaders(finalUrl, responseHeaders)),
    observatory(host),
  ]);

  const findings = [...headerReport.findings];
  if (obs && /^[DF]/.test(obs.grade)) {
    findings.push({
      id: 'observatory-grade', severity: obs.grade.startsWith('F') ? 'medium' : 'low',
      title: `Mozilla Observatory grades this site ${obs.grade}`,
      detail: `${obs.testsFailed ?? 'Several'} of ${(obs.testsPassed ?? 0) + (obs.testsFailed ?? 0)} security checks failed.`,
      fix: obs.detailsUrl ? `See the full breakdown at ${obs.detailsUrl}` : 'Review the site’s security headers.',
    });
  }

  return {
    included: true,
    https: headerReport.https,
    headers: headerReport.headers,
    stackDisclosure: headerReport.stackDisclosure,
    observatory: obs,
    findings,
  };
}

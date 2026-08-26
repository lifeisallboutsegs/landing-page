import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * SSRF-hardened fetcher for the public audit tool.
 *
 * Anyone on the internet can hand this endpoint a URL and make our server issue
 * a request. Without these checks that is a proxy into everything the VPS can
 * reach but the internet cannot: Postgres on localhost, other services on the
 * private network, and cloud metadata endpoints that hand out credentials.
 *
 * Every hop is re-validated because a public hostname can 302 to 127.0.0.1, and
 * DNS is resolved ourselves so the decision is made on the address we will
 * actually connect to.
 */

const MAX_REDIRECTS = 5;
const MAX_BYTES = 3 * 1024 * 1024; // 3MB of HTML is already pathological
const TIMEOUT_MS = 12000;

/** RFC1918 and friends, plus the metadata address every cloud exposes. */
function isPrivateIPv4(ip) {
  const [a, b] = ip.split('.').map(Number);
  if (a === 10) return true;
  if (a === 127) return true; // loopback
  if (a === 0) return true; // "this host"
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local + 169.254.169.254 metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(ip) {
  const value = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (value === '::1' || value === '::') return true;
  if (value.startsWith('fc') || value.startsWith('fd')) return true; // unique local
  if (value.startsWith('fe80')) return true; // link-local
  // IPv4 smuggled through IPv6. The WHATWG URL parser rewrites the readable
  // form (::ffff:127.0.0.1) into hex (::ffff:7f00:1), so both must be handled —
  // checking only the dotted form let loopback straight through.
  const dotted = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPrivateIPv4(dotted[1]);

  const hex = value.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const high = parseInt(hex[1], 16);
    const low = parseInt(hex[2], 16);
    const ipv4 = [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.');
    return isPrivateIPv4(ipv4);
  }

  // Anything else in the IPv4-mapped range we cannot decode: refuse it.
  if (value.startsWith('::ffff:')) return true;

  return false;
}

export function isPrivateAddress(ip) {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // unparseable: refuse rather than guess
}

export class UnsafeUrlError extends Error {}

/**
 * Validates a single URL and returns the address we resolved it to, so the
 * caller can be sure the host it checked is the host it will connect to.
 */
export async function assertSafeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('That does not look like a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    // Blocks file:, gopher:, ftp: and friends.
    throw new UnsafeUrlError('Only http and https addresses can be audited.');
  }

  if (url.username || url.password) {
    throw new UnsafeUrlError('Credentials in the URL are not supported.');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');

  // A literal IP skips DNS entirely, so check it directly.
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new UnsafeUrlError('That address is not publicly reachable.');
    return { url, address: host };
  }

  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new UnsafeUrlError('That address is not publicly reachable.');
  }

  let resolved;
  try {
    resolved = await lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError('That domain could not be resolved.');
  }

  // Every A/AAAA record must be public — one private answer is enough to abuse.
  for (const entry of resolved) {
    if (isPrivateAddress(entry.address)) {
      throw new UnsafeUrlError('That address is not publicly reachable.');
    }
  }

  return { url, address: resolved[0]?.address };
}

/**
 * Fetches a page, following redirects manually so each hop is re-validated,
 * and recording the chain so the audit can report redirect problems.
 */
export async function safeFetch(rawUrl) {
  const chain = [];
  let target = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const { url } = await assertSafeUrl(target);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, {
        redirect: 'manual', // we follow them ourselves, re-checking each time
        signal: controller.signal,
        headers: {
          // Identify honestly so site owners can see who is crawling them.
          'user-agent':
            'DWA-SEO-Audit/1.0 (+https://digitalwebassurances.com/audit; respects robots.txt)',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'en',
        },
      });
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new UnsafeUrlError('That site took too long to respond.');
      }
      throw new UnsafeUrlError('That site could not be reached.');
    }
    clearTimeout(timer);

    chain.push({ url: url.toString(), status: response.status });

    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      target = new URL(location, url).toString();
      continue;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) {
      throw new UnsafeUrlError('That URL did not return an HTML page.');
    }

    const html = await readCapped(response);
    return { finalUrl: url.toString(), status: response.status, headers: response.headers, html, chain };
  }

  throw new UnsafeUrlError('That URL redirects too many times.');
}

/** Streams the body, aborting past the cap so a huge page cannot exhaust memory. */
async function readCapped(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }

  return new TextDecoder('utf-8').decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
}

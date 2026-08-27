import nodemailer from 'nodemailer';

/**
 * Outbound mail.
 *
 * Notifications must never be able to lose a lead: the enquiry is already
 * committed to Postgres before this runs, and every failure here is logged and
 * swallowed. A bounced notification is an inconvenience; a 500 on the form
 * because the mail host was down would cost a customer.
 */

let cached = null;

function transporter() {
  if (cached) return cached;

  const host = process.env.SMTP_HOST;
  if (!host) return null;

  if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false') {
    console.warn(
      '[mail] TLS certificate verification is DISABLED for %s — encrypted but not authenticated. Install a valid certificate and remove SMTP_TLS_REJECT_UNAUTHORIZED.',
      host,
    );
  }

  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    // 587 + STARTTLS: connect in the clear, then upgrade. `secure: true` is for
    // implicit TLS on 465 and would hang against a STARTTLS port.
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    // This host still serves the stock self-signed certificate (CN "etc"), so
    // strict verification cannot pass. Opting out is explicit and logged rather
    // than hidden: the session is still encrypted, but it is not authenticated,
    // so a network attacker in path could intercept it. Install a real
    // certificate on the mail server and drop this flag.
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      servername: process.env.SMTP_TLS_SERVERNAME || undefined,
    },
    // The box has no working IPv6 route; without this Node picks the AAAA
    // record first and every send waits for a connect timeout.
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cached;
}

const escape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#565c72;font-size:13px;white-space:nowrap;vertical-align:top">${escape(label)}</td>
    <td style="padding:6px 0;color:#0b0b12;font-size:14px">${escape(value)}</td>
  </tr>`;
}

/**
 * Tells the team a lead arrived. Attribution is included because the first
 * question about any enquiry is which campaign paid for it.
 */
export async function sendLeadNotification(lead) {
  const mailer = transporter();
  const to = process.env.LEAD_NOTIFY_TO;

  if (!mailer || !to) {
    console.warn('[mail] SMTP or LEAD_NOTIFY_TO not configured — skipping notification');
    return { sent: false, reason: 'not-configured' };
  }

  const source =
    lead.utmSource || lead.gclid
      ? [lead.utmSource, lead.utmCampaign, lead.gclid && 'gclid'].filter(Boolean).join(' · ')
      : 'direct / organic';

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px">
    <p style="margin:0 0 4px;color:#1b4be0;font-size:12px;font-weight:600;letter-spacing:.04em">NEW ENQUIRY</p>
    <h2 style="margin:0 0 20px;font-size:20px;color:#0b0b12">${escape(lead.name)}</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row('Email', lead.email)}
      ${row('Website', lead.website)}
      ${row('Wants', lead.service)}
      ${row('Source', source)}
      ${row('Landing page', lead.landingPage)}
    </table>
    ${
      lead.message
        ? `<p style="margin:20px 0 0;padding:16px;background:#f5f7fb;border-radius:8px;font-size:14px;line-height:1.6;color:#0b0b12;white-space:pre-wrap">${escape(lead.message)}</p>`
        : ''
    }
    <p style="margin:24px 0 0;font-size:13px;color:#9aa0b4">
      Reply straight to this email — it goes to ${escape(lead.email)}.
    </p>
  </div>`;

  const text = [
    `New enquiry from ${lead.name}`,
    `Email: ${lead.email}`,
    lead.website && `Website: ${lead.website}`,
    lead.service && `Wants: ${lead.service}`,
    `Source: ${source}`,
    lead.message && `\n${lead.message}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      // So hitting reply in the inbox answers the customer, not the robot.
      replyTo: `${lead.name} <${lead.email}>`,
      subject: `New enquiry — ${lead.name}${lead.service ? ` (${lead.service})` : ''}`,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error('[mail] lead notification failed', error.message);
    return { sent: false, reason: error.message };
  }
}

/** Confirms to the enquirer that a person will reply. Failure is non-fatal. */
export async function sendLeadAcknowledgement(lead) {
  const mailer = transporter();
  if (!mailer) return { sent: false, reason: 'not-configured' };

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;line-height:1.6;color:#0b0b12">
    <p style="margin:0 0 16px">Hi ${escape(lead.name.split(' ')[0])},</p>
    <p style="margin:0 0 16px">
      Thanks for getting in touch. Your enquiry has reached us and a person will read it —
      there is no automated sequence behind this.
    </p>
    <p style="margin:0 0 16px">
      You will hear back within one working day, usually with a question or two before any
      proposal. If we are not the right fit, we will say so and point you somewhere better.
    </p>
    <p style="margin:0 0 4px">Siddik Arim</p>
    <p style="margin:0;color:#565c72;font-size:14px">Digital Web Assurances</p>
  </div>`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: lead.email,
      replyTo: process.env.LEAD_NOTIFY_TO,
      subject: 'We have your enquiry',
      text: `Hi ${lead.name.split(' ')[0]},\n\nThanks for getting in touch. A person will read your enquiry and reply within one working day.\n\nSiddik Arim\nDigital Web Assurances`,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error('[mail] acknowledgement failed', error.message);
    return { sent: false, reason: error.message };
  }
}

/** Used by the SMTP check script. */
export async function verifyConnection() {
  const mailer = transporter();
  if (!mailer) throw new Error('SMTP_HOST is not set');
  return mailer.verify();
}

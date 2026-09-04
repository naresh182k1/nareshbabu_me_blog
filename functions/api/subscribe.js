// Newsletter subscribe endpoint.
// Appends {timestamp, email, source, page, pageTitle} to a Google Sheet
// via a Google Cloud service account — no third-party form service, no
// secret ever reaches the browser.
//
// Required Cloudflare Pages environment variables (set as *secrets*, not
// plaintext vars, via `wrangler pages secret put <NAME>` or the dashboard):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL    service account's client_email
//   GOOGLE_SERVICE_ACCOUNT_KEY      service account's private_key (PEM, \n kept literal)
//   GOOGLE_SHEET_ID                 target spreadsheet ID (from its URL)
// Optional plain var:
//   GOOGLE_SHEET_TAB                sheet/tab name (default "Subscribers")
//
// See spec.md "Newsletter → Google Sheets setup" for the one-time console steps.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const source = String(body?.source || 'unknown').slice(0, 40);
  const page = String(body?.page || '').slice(0, 200);
  const pageTitle = String(body?.pageTitle || '').slice(0, 200);

  // Honeypot: forms send an empty hidden field; if it arrived filled, this
  // is a bot. Report success without writing a row.
  if (body?.company_website) {
    return json({ ok: true });
  }

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_SERVICE_ACCOUNT_KEY || !env.GOOGLE_SHEET_ID) {
    return json({ error: 'Newsletter is not configured yet' }, 503);
  }

  try {
    const accessToken = await getGoogleAccessToken(env);
    const tab = env.GOOGLE_SHEET_TAB || 'Subscribers';
    const range = `${tab}!A:E`;

    const sheetsRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[new Date().toISOString(), email, source, page, pageTitle]],
        }),
      }
    );

    if (!sheetsRes.ok) {
      console.error('Sheets append failed', sheetsRes.status, await sheetsRes.text());
      return json({ error: 'Could not save subscription' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('subscribe error', err);
    return json({ error: 'Could not save subscription' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// --- Google service-account OAuth2 (JWT bearer flow), signed with the
// runtime's native Web Crypto — no external dependency needed. ---

let cachedToken = null; // { token, expiresAt } — reused across requests on a warm isolate

async function getGoogleAccessToken(env) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const unsigned = `${base64url(encoder.encode(JSON.stringify(header)))}.${base64url(encoder.encode(JSON.stringify(claims)))}`;

  const key = await importPrivateKey(env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
  const jwt = `${unsigned}.${base64url(new Uint8Array(signature))}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const data = await tokenRes.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function importPrivateKey(pem) {
  const normalized = pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem;
  const body = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function base64url(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Netlify Function: verify-license
// Endpoint: POST /.netlify/functions/verify-license
// Requires environment variables:
// - GUMROAD_PRODUCT_PERMA (your Gumroad product permalink) [required]
// - GUMROAD_ACCESS_TOKEN (optional, if your setup needs it)
//
// This function forwards the license_key + product_permalink to Gumroad's v2 license verify endpoint.
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ valid: false, message: 'Only POST allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const licenseKey = (body.licenseKey || '').trim();
    if (!licenseKey) {
      return { statusCode: 400, body: JSON.stringify({ valid: false, message: 'licenseKey required' }) };
    }

    const pattern = /^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/;
    if (!pattern.test(licenseKey.toUpperCase())) {
      return { statusCode: 400, body: JSON.stringify({ valid: false, message: 'Invalid license format' }) };
    }

    const productPermalink = process.env.GUMROAD_PRODUCT_PERMA;
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN || '';

    if (!productPermalink) {
      return { statusCode: 500, body: JSON.stringify({ valid: false, message: 'Server not configured' }) };
    }

    const params = new URLSearchParams();
    params.append('product_permalink', productPermalink);
    params.append('license_key', licenseKey);
    if (accessToken) params.append('access_token', accessToken);

    const resp = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const gum = await resp.json();

    if (gum && gum.success) {
      // Optionally: restrict by email or other purchase fields inside gum.purchase
      return { statusCode: 200, body: JSON.stringify({ valid: true, license: gum }) };
    } else {
      const message = gum && gum.error ? gum.error : 'License invalid';
      return { statusCode: 400, body: JSON.stringify({ valid: false, message }) };
    }
  } catch (err) {
    console.error('verify-license error', err);
    return { statusCode: 500, body: JSON.stringify({ valid: false, message: 'Verification failed' }) };
  }
};
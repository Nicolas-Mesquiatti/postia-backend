exports.handler = async function(event) {
  const { code } = event.queryStringParameters || {};

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No code provided' }) };
  }

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/tiktok_tokens`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          open_id: data.open_id,
        }),
      });

      return {
        statusCode: 302,
        headers: { Location: 'https://nicolas-mesquiatti.github.io/postia/?tiktok=connected' },
        body: '',
      };
    } else {
      return {
        statusCode: 302,
        headers: { Location: 'https://nicolas-mesquiatti.github.io/postia/?tiktok=error' },
        body: '',
      };
    }
  } catch (err) {
    return {
      statusCode: 302,
      headers: { Location: 'https://nicolas-mesquiatti.github.io/postia/?tiktok=error' },
      body: '',
    };
  }
};
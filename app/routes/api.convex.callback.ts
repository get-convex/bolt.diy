import type { LoaderFunctionArgs } from '@remix-run/node';

const CLIENT_ID = '855ec8198b9c462d';
const CLIENT_SECRET = '3019129ad5e44b619f673fb87686a939';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return Response.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // Get the current origin for the redirect_uri
    const origin = url.origin;

    // Exchange the code for a token
    const tokenResponse = await fetch('https://api.convex.dev/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: origin + '/convex/callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);

      return Response.json({ error: 'Failed to exchange code for token' }, { status: 500 });
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; token_type: 'bearer' };
    console.log(tokenData);

    // Return the token as JSON
    return Response.json({ token: tokenData.access_token });
  } catch (error) {
    console.error('Error in Convex OAuth callback:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
